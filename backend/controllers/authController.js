// ============================================================
// LOGIN CON SESIÓN - Reportes UNU
// Guía simple de cómo entra un alumno (lee de arriba a abajo):
//  1) Front manda {codigo, clave}
//  2) Busco en tabla `usuario` (los que ya tienen cuenta)
//  3) Si no está, busco en tabla `estudiante` (la "API" de la UNU)
//     y le creo su `usuario` con rol 3 = Estudiante
//  4) Comparo la clave con bcrypt (nunca guardo clave normal)
//  5) Creo la sesión: req.session.auth = {quién es + qué rol tiene}
//     La cookie `sid` viaja sola, el front no guarda nada.
// ============================================================
const db = require('../config/database');
const bcrypt = require('bcrypt');

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
    // ==================================================
    // 1) BUSCAR EN TABLA USUARIO (PRIORIDAD ABSOLUTA)
    // ==================================================
    const [usuarios] = await db.query(`
      SELECT id_usuario, codigo, clave, id_rol, id_estudiante, id_trabajador
      FROM usuario
      WHERE codigo = ?
      LIMIT 1
    `, [codigo]);
    if (usuarios.length > 0) {
      const usuario = usuarios[0];
      // Comparo la clave que escribió con la guardada (que está revuelta con bcrypt)
      const passwordOk = await bcrypt.compare(clave, usuario.clave);
      if (!passwordOk) {
        // Mensaje igual si no existe o si la clave está mal (no doy pistas)
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }
      // Clave correcta: creo sesión nueva con sus datos
      await crearSesionNueva(req, {
        id_usuario: usuario.id_usuario,
        id_rol: usuario.id_rol,
        id_estudiante: usuario.id_estudiante,
        id_trabajador: usuario.id_trabajador
      });

      return res.json({
        success: true,
        message: 'Usuario autenticado',
        data: req.session.auth
      });
    }
    // ==================================================
    // 2) NO EXISTE EN USUARIO → BUSCAR EN ESTUDIANTE (API)
    // La tabla `estudiante` simula la API de alumnos: no tiene llaves
    // hacia otras tablas, solo se lee de aquí.
    // ==================================================
    const [estudiantes] = await db.query(`
      SELECT id_estudiante, codigo, clave
      FROM estudiante
      WHERE codigo = ?
      LIMIT 1
    `, [codigo]);
    if (estudiantes.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    const estudiante = estudiantes[0];
    const passwordEstudianteOk = await bcrypt.compare(clave, estudiante.clave);
    if (!passwordEstudianteOk) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    // ==================================================
    // 3) VER SI EL ESTUDIANTE YA TIENE USUARIO
    // Si es su primer login, le creo su usuario con rol 3.
    // ==================================================
    const [usuariosEst] = await db.query(`
      SELECT id_usuario, id_rol
      FROM usuario
      WHERE id_estudiante = ?
      LIMIT 1
    `, [estudiante.id_estudiante]);
    const claveHash = await bcrypt.hash(clave, 10);
    let id_usuario;
    let id_rol;
    if (usuariosEst.length > 0) {
      id_usuario = usuariosEst[0].id_usuario;
      id_rol = usuariosEst[0].id_rol;
      await db.query(`
        UPDATE usuario
        SET clave = ?
        WHERE id_usuario = ?
      `, [claveHash, id_usuario]);
    } else {
      const ID_ROL_ESTUDIANTE = 3;
      const [insert] = await db.query(`
        INSERT INTO usuario (codigo, clave, id_rol, id_estudiante, id_trabajador)
        VALUES (?, ?, ?, ?, NULL)
      `, [codigo, claveHash, ID_ROL_ESTUDIANTE, estudiante.id_estudiante]);
      id_usuario = insert.insertId;
      id_rol = ID_ROL_ESTUDIANTE;
    }
    // ==================================================
    // 4) CREAR SESIÓN
    // ==================================================
    await crearSesionNueva(req, {
      id_usuario,
      id_rol,
      id_estudiante: estudiante.id_estudiante,
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
