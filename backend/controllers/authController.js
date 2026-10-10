// ============================================================
// LOGIN CON SESIÓN - Reportes UNU
// Guía simple (lee de arriba a abajo):
//  1) Front manda {codigo, clave}
//  2) Busco en tabla `usuario` (SOLO personal: roles 1 y 2)
//  3) Si no está, busco en tabla `estudiante` (la "API" de la UNU)
//     y creo SOLO sesión, sin fila en `usuario`
//  4) Comparo la clave con bcrypt (nunca guardo clave normal)
//  5) Creo la sesión: req.session.auth = {quién es + qué rol tiene}
//     Alumno: {id_rol: 3, codigo_estudiante} (rol 3 solo vive en sesión)
//     La cookie `sid` viaja sola, el front no guarda nada.
// ============================================================
const db = require('../config/database');
const bcrypt = require('bcrypt');
const { estaBloqueada, registrarFallo, limpiarIntentos } = require('../config/seguridad');

// Respuesta 429 unificada (no dice si la cuenta existe o no)
function respuestaBloqueo(res) {
  return res.status(429).json({
    success: false,
    message: 'Cuenta bloqueada temporalmente por demasiados intentos, espera 15 minutos'
  });
}

// Fallo de credenciales: suma al freno por cuenta y avisa si se bloqueó
async function falloCredenciales(req, res, codigo) {
  const bloqueada = await registrarFallo(codigo);
  if (bloqueada) return respuestaBloqueo(res);
  // Mensaje igual si no existe o si la clave está mal (no doy pistas)
  return res.status(401).json({
    success: false,
    message: 'Credenciales inválidas'
  });
}

// Ayuda: crea una sesión nueva desde cero.
// Esto evita que un atacante te pase su sesión vieja (fijación de sesión).
function crearSesionNueva(req, datosAuth) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.auth = datosAuth;
      req.session.save((err2) => {
        if (err2) return reject(err2);
        resolve();
      });
    });
  });
}

const login = async (req, res) => {
  try {
    const { codigo, clave } = req.body;
    // Paso 1: reviso que manden los 2 datos
    if (!codigo || !clave) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos'
      });
    }
    // Paso 1b: freno por cuenta (antes de tocar la BD de usuarios)
    if (await estaBloqueada(codigo)) {
      return respuestaBloqueo(res);
    }
    // ==================================================
    // 1) BUSCAR EN TABLA USUARIO (SOLO PERSONAL: roles 1 y 2)
    // ==================================================
    const [usuarios] = await db.query(`
      SELECT id_usuario, codigo, clave, id_rol, id_trabajador
      FROM usuario
      WHERE codigo = ?
      LIMIT 1
    `, [codigo]);
    if (usuarios.length > 0) {
      const usuario = usuarios[0];
      // Comparo la clave que escribió con la guardada (que está revuelta con bcrypt)
      const passwordOk = await bcrypt.compare(clave, usuario.clave);
      if (!passwordOk) {
        return falloCredenciales(req, res, codigo);
      }
      // Clave correcta: creo sesión nueva con sus datos
      await limpiarIntentos(codigo);
      await crearSesionNueva(req, {
        id_usuario: usuario.id_usuario,
        id_rol: usuario.id_rol,
        id_estudiante: null,
        codigo_estudiante: null,
        id_trabajador: usuario.id_trabajador
      });

      return res.json({
        success: true,
        message: 'Usuario autenticado',
        data: req.session.auth
      });
    }
    // ==================================================
    // 2) NO ES PERSONAL → BUSCAR EN ESTUDIANTE (API SIMULADA)
    // La tabla `estudiante` simula la API de alumnos: solo se lee,
    // no se crea fila en `usuario` (el rol 3 solo vive en la sesión).
    // ==================================================
    const [estudiantes] = await db.query(`
      SELECT id_estudiante, codigo, clave
      FROM estudiante
      WHERE codigo = ?
      LIMIT 1
    `, [codigo]);
    if (estudiantes.length === 0) {
      return falloCredenciales(req, res, codigo);
    }
    const estudiante = estudiantes[0];
    const passwordEstudianteOk = await bcrypt.compare(clave, estudiante.clave);
    if (!passwordEstudianteOk) {
      return falloCredenciales(req, res, codigo);
    }
    // ==================================================
    // 3) CREAR SESIÓN DE ALUMNO (sin tocar `usuario`)
    // ==================================================
    await limpiarIntentos(codigo);
    await crearSesionNueva(req, {
      id_usuario: null,
      id_rol: 3,
      id_estudiante: estudiante.id_estudiante,
      codigo_estudiante: estudiante.codigo,
      id_trabajador: null
    });
    return res.json({
      success: true,
      message: 'Estudiante autenticado',
      data: req.session.auth
    });
  } catch (error) {
    console.error('[auth.login]', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Guía: el front pregunta "¿quién está logueado?" con GET /me.
// Si no hay sesión devuelvo data:null (no es error, solo "nadie").
const me = (req, res) => {
  if (!req.session.auth) {
    return res.status(200).json({
      success: true,
      data: null
    });
  }
  return res.status(200).json({
    success: true,
    data: req.session.auth
  });
};

// Guía: salir borra la sesión en MySQL y la cookie `sid` en el navegador.
const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'No se pudo cerrar sesión'
      });
    }
    res.clearCookie('sid');
    return res.json({
      success: true,
      message: 'Sesión cerrada'
    });
  });
};

module.exports = {
  login,
  me,
  logout
};
