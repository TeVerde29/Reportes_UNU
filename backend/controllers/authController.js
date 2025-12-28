const db = require('../config/database');
const bcrypt = require('bcrypt');

/**
 * POST /api/auth/login
 * Login por sesión (cookies)
 */
const login = async (req, res) => {
  try {
    const { codigo, clave } = req.body;

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

      const passwordOk = await bcrypt.compare(clave, usuario.clave);
      if (!passwordOk) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // ✔ Usuario válido → crear sesión
      req.session.auth = {
        id_usuario: usuario.id_usuario,
        id_rol: usuario.id_rol,
        id_estudiante: usuario.id_estudiante,
        id_trabajador: usuario.id_trabajador
      };

      return res.json({
        success: true,
        message: 'Usuario autenticado',
        data: req.session.auth
      });
    }

    // ==================================================
    // 2) NO EXISTE EN USUARIO → BUSCAR EN ESTUDIANTE (API)
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

    // ✔ estudiante.clave está HASHEADA (bcrypt)
    const passwordEstudianteOk = await bcrypt.compare(clave, estudiante.clave);
    if (!passwordEstudianteOk) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // ==================================================
    // 3) VER SI EL ESTUDIANTE YA TIENE USUARIO
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
      // 🔁 Existe → actualizar clave
      id_usuario = usuariosEst[0].id_usuario;
      id_rol = usuariosEst[0].id_rol;

      await db.query(`
        UPDATE usuario
        SET clave = ?
        WHERE id_usuario = ?
      `, [claveHash, id_usuario]);
    } else {
      // 🆕 No existe → crear usuario
      const ID_ROL_ESTUDIANTE = 3; // ajusta según tu tabla rol

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
    req.session.auth = {
      id_usuario,
      id_rol,
      id_estudiante: estudiante.id_estudiante,
      id_trabajador: null
    };

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


/**
 * GET /api/auth/me
 * Saber si hay sesión activa
 */
const me = (req, res) => {
  if (!req.session.auth) {
    return res.status(401).json({
      success: false,
      message: 'No autenticado'
    });
  }

  return res.json({
    success: true,
    data: req.session.auth
  });
};

/**
 * POST /api/auth/logout
 * Cerrar sesión
 */
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
