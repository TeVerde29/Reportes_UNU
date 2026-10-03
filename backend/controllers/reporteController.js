const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'Reportes_UNU_IMG', 'uploads', 'reportes');

function generarCodigoSeguro() {
  const U = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const L = "abcdefghijklmnopqrstuvwxyz";
  const D = "0123456789";
  const all = U + L + D ;
  let codigo = '';
  for (let i = 0; i < 32; i++) {
    codigo += all.charAt(Math.floor(Math.random() * all.length));
  }
  return codigo;
}

// ============================================================
// SUBIDA DE FOTOS (multer)
// Guía: solo imágenes de 5MB máx. El nombre se cambia por uno
// al azar de 32 letras (no guardo tu nombre original) para que
// nadie adivine rutas ni suba archivos .exe/.php disfrazados.
// ============================================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = UPLOAD_DIR;
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error('Tipo de archivo no permitido'), '');
    }
    const nombreSeguro = generarCodigoSeguro();
    const nombreFinal = `${nombreSeguro}${ext}`;
    cb(null, nombreFinal);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024},
  fileFilter: function (req, file, cb) {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPG, JPEG, PNG, WEBP)'));
    }
  }
});

const crearReporte = async (req, res) => {
    try {
        const estado = 'Pendiente';
        // El dueño sale de la sesión (API simulada), nunca del body
        const codigo_estudiante = req.session.auth.codigo_estudiante;
        const { titulo, descripcion, id_tipo_problema, id_ubicacion } = req.body;
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se recibió ninguna imagen'
            });
        }
        const tituloLimpio = typeof titulo === 'string' ? titulo.trim() : '';
        const descripcionLimpia = typeof descripcion === 'string' ? descripcion.trim() : '';
        const idTipo = Number(id_tipo_problema);
        const idUbi = Number(id_ubicacion);
        if (!tituloLimpio || !descripcionLimpia || !Number.isInteger(idTipo) || idTipo <= 0 || !Number.isInteger(idUbi) || idUbi <= 0) {
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'Faltan datos obligatorios'
            });
        }
        if (tituloLimpio.length < 5 || tituloLimpio.length > 150) {
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'Título de 5 a 150 caracteres'
            });
        }
        if (descripcionLimpia.length > 1000) {
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'Descripción de máximo 1000 caracteres'
            });
        }
        const [estadoRows] = await db.query(
            'SELECT id_estado FROM estado WHERE nombre = ? LIMIT 1',
                [estado]
            );
        if (!estadoRows || estadoRows.length === 0) {
        if (req.file && req.file.path) fs.unlinkSync(req.file.path);
        return res.status(500).json({
            success: false,
            message: `No existe el estado "${estado}" en la tabla estado`
        });
        }
        const id_estado = estadoRows[0].id_estado;
        const fotoUrl = `/uploads/reportes/${req.file.filename}`;
        const [reporte] = await db.query(`
            INSERT INTO reporte(titulo, descripcion, foto_url, fecha_reporte, fecha_edicion, cantidad_reacciones, id_estado, codigo_estudiante, id_tipo_problema, id_ubicacion)
            VALUES (?, ?, ?, NOW(), NOW(), 0, ?, ?, ?, ?)`,
            [tituloLimpio, descripcionLimpia, fotoUrl, id_estado, codigo_estudiante, idTipo, idUbi]
        );
        const [rows] = await db.query(
            `SELECT * FROM reporte WHERE id_reporte = ?`,
            [reporte.insertId]
        );
        res.status(201).json({
            success: true,
            message: 'Reporte creado exitosamente',
            data: rows[0]
        });
    } catch (error) {
        console.error('Error al crear reporte:', error);
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error al eliminar archivo:', unlinkError);
            }
        }
        res.status(500).json({
            success: false,
            message: 'Error al crear reporte'
        });
    }
};

const actualizarReporte = async (req, res) => {
  let backupPath = null;
  let targetPath = null;
  const safeUnlink = (p) => {
    try { if (p && fs.existsSync(p)) fs.unlinkSync(p); } catch (e) { console.error('Error al eliminar:', e); }
  };
  try {
    const { id } = req.params;
    const idReporte = Number(id);
    if (!Number.isInteger(idReporte) || idReporte <= 0) {
      if (req.file) safeUnlink(req.file.path);
      return res.status(400).json({ success: false, message: 'Id inválido' });
    }
    const { titulo, descripcion, id_estado, id_tipo_problema, id_ubicacion } = req.body;
    const tituloLimpio = typeof titulo === 'string' ? titulo.trim() : '';
    const idTipo = Number(id_tipo_problema);
    const idUbi = Number(id_ubicacion);
    if (!tituloLimpio || !Number.isInteger(idTipo) || idTipo <= 0 || !Number.isInteger(idUbi) || idUbi <= 0) {
      if (req.file) safeUnlink(req.file.path);
      return res.status(400).json({ success: false, message: 'Faltan campos obligatorios (titulo, tipo o ubicación)' });
    }
    if (tituloLimpio.length < 5 || tituloLimpio.length > 150) {
      if (req.file) safeUnlink(req.file.path);
      return res.status(400).json({ success: false, message: 'Título de 5 a 150 caracteres' });
    }
    const descripcionLimpia = typeof descripcion === 'string' ? descripcion.trim() : '';
    if (descripcionLimpia.length > 1000) {
      if (req.file) safeUnlink(req.file.path);
      return res.status(400).json({ success: false, message: 'Descripción de máximo 1000 caracteres' });
    }
    const idEstado = id_estado == null || id_estado === '' ? null : Number(id_estado);
    if (idEstado !== null && ![1, 2, 3].includes(idEstado)) {
      if (req.file) safeUnlink(req.file.path);
      return res.status(400).json({ success: false, message: 'Estado inválido (solo 1, 2 o 3)' });
    }
    // Solo el dueño edita su reporte (código del API, sale de la sesión)
    const [propio] = await db.query(
      'SELECT codigo_estudiante FROM reporte WHERE id_reporte = ?',
      [idReporte]
    );
    if (propio.length === 0) {
      if (req.file) safeUnlink(req.file.path);
      return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    }
    if (propio[0].codigo_estudiante !== req.session.auth.codigo_estudiante) {
      if (req.file) safeUnlink(req.file.path);
      return res.status(403).json({ success: false, message: 'No es tu reporte' });
    }
    const fecha_edicion = new Date();
    if (req.file && req.file.path) {
      const [rowsFoto] = await db.query("SELECT foto_url FROM reporte WHERE id_reporte = ?", [idReporte]);
      if (rowsFoto.length > 0 && rowsFoto[0].foto_url) {
        const filenameActual = path.basename(rowsFoto[0].foto_url);
        const uploadDir = UPLOAD_DIR;
        targetPath = path.join(uploadDir, filenameActual);
        if (fs.existsSync(targetPath)) {
          backupPath = `${targetPath}.bak_${Date.now()}`;
          fs.renameSync(targetPath, backupPath);
        }
        fs.renameSync(req.file.path, targetPath);
      } else {
        safeUnlink(req.file.path);
      }
    }
    await db.query(`
      UPDATE reporte
      SET titulo = ?, descripcion = ?, fecha_edicion = ?, id_estado = COALESCE(?, id_estado), id_tipo_problema = ?, id_ubicacion = ?
      WHERE id_reporte = ?
    `, [tituloLimpio, descripcionLimpia, fecha_edicion, idEstado, idTipo, idUbi, idReporte]);
    if (backupPath) safeUnlink(backupPath);
    return res.status(200).json({
      success: true,
      message: 'Reporte actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar reporte:', error);
    if (req.file) safeUnlink(req.file.path);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const revisarReporte = async (req, res) => {
    try {
        const { id } = req.params;
        const idReporte = Number(id);
        if (!Number.isInteger(idReporte) || idReporte <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Id inválido'
          });
        }
        const { titulo, descripcion, id_tipo_problema, id_estado } = req.body;
    const [existe] = await db.query(
        `SELECT id_reporte FROM reporte WHERE id_reporte = ?`,
        [idReporte]
    );
    if (existe.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }
    const tituloLimpio = typeof titulo === 'string' ? titulo.trim() : '';
    const idTipo = Number(id_tipo_problema);
    const idEstado = Number(id_estado);
    if (!tituloLimpio || !Number.isInteger(idTipo) || idTipo <= 0 || ![1, 2, 3].includes(idEstado)) {
      return res.status(400).json({
        success: false,
        message: 'Datos obligatorios incompletos (estado solo 1, 2 o 3)'
      });
    }
    if (tituloLimpio.length > 150) {
      return res.status(400).json({
        success: false,
        message: 'Título de máximo 150 caracteres'
      });
    }
    const descripcionLimpia = typeof descripcion === 'string' ? descripcion.trim() : '';
    if (descripcionLimpia.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Descripción de máximo 1000 caracteres'
      });
    }
    // El personal atiende: queda registrado quién lo hizo
    const idUsuario = req.session.auth.id_usuario;
    await db.query(
      `
      UPDATE reporte
      SET
        titulo = ?,
        descripcion = ?,
        id_tipo_problema = ?,
        id_estado = ?,
        id_usuario = ?,
        fecha_edicion = NOW()
      WHERE id_reporte = ?
      `,
      [
        tituloLimpio,
        descripcionLimpia || null,
        idTipo,
        idEstado,
        idUsuario,
        idReporte
      ]
    );
    res.status(200).json({
      success: true,
      message: 'Reporte revisado correctamente'
    });
  } catch (error) {
    console.error('Error al revisar reporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error al revisar reporte'
    });
  }
};

// ============================================================
// ELIMINAR REPORTE (rechazo del personal: se borra todo)
// Guía: observaciones punto 1. Borra reacciones (CASCADE),
// fila e imagen. Solo personal (roles 1 y 2).
// ============================================================
const eliminarReporte = async (req, res) => {
  try {
    const idReporte = Number(req.params.id);
    if (!Number.isInteger(idReporte) || idReporte <= 0) {
      return res.status(400).json({ success: false, message: 'Id inválido' });
    }
    const [rows] = await db.query(
      'SELECT foto_url FROM reporte WHERE id_reporte = ?',
      [idReporte]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    }
    await db.query('DELETE FROM reporte WHERE id_reporte = ?', [idReporte]);
    if (rows[0].foto_url) {
      const fotoPath = path.join(UPLOAD_DIR, path.basename(rows[0].foto_url));
      try { if (fs.existsSync(fotoPath)) fs.unlinkSync(fotoPath); } catch (e) { console.error('Error al eliminar foto:', e); }
    }
    return res.status(200).json({ success: true, message: 'Reporte eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar reporte:', error);
    return res.status(500).json({ success: false, message: 'Error al eliminar reporte' });
  }
};

// ============================================================
// FILTROS + PAGINACIÓN (?page=&limit=&id_tipo_problema=&id_ubicacion=&q=)
// Guía: los 3 listados del inicio traían el 100%. Ahora por páginas
// de 10 y con filtros, para que aguante miles de reportes.
// ============================================================
function leerPaginacion(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  return { page, limit, offset: (page - 1) * limit };
}

function leerFiltros(query) {
  const conds = [];
  const vals = [];
  const idTipo = Number(query.id_tipo_problema);
  if (Number.isInteger(idTipo) && idTipo > 0) {
    conds.push('r.id_tipo_problema = ?');
    vals.push(idTipo);
  }
  const idUbi = Number(query.id_ubicacion);
  if (Number.isInteger(idUbi) && idUbi > 0) {
    conds.push('r.id_ubicacion = ?');
    vals.push(idUbi);
  }
  const q = typeof query.q === 'string' ? query.q.trim() : '';
  if (q) {
    conds.push('r.titulo LIKE ?');
    vals.push(`%${q}%`);
  }
  return { extraWhere: conds.length ? ' AND ' + conds.join(' AND ') : '', vals };
}

const obtenerReportePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const [reportes] = await db.query(`
      SELECT
        r.*,
        CONCAT(e.nombres,' ',e.apellido_paterno,' ',e.apellido_materno) AS estudiante,
        e.escuela AS carrera,
        es.nombre AS estado,
        tp.nombre AS tipo_problema,
        u.nombre AS ubicacion
      FROM reporte r
      INNER JOIN estudiante e ON r.codigo_estudiante = e.codigo
      INNER JOIN estado es ON r.id_estado = es.id_estado
      INNER JOIN tipo_problema tp ON r.id_tipo_problema = tp.id_tipo_problema
      INNER JOIN ubicacion u ON r.id_ubicacion = u.id_ubicacion
      WHERE r.id_reporte = ?
      LIMIT 1
    `, [id]);
    if (reportes.length === 0) {
      return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    }
    res.status(200).json({
      success: true,
      message: 'Reporte obtenido correctamente',
      data: reportes[0]
    });
  } catch (error) {
    console.error('Error al obtener reporte por id:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener reporte por id' });
  }
};

const obtenerReportesPorIdEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const idEstado = Number(id);
    if (!Number.isInteger(idEstado) || idEstado <= 0) {
      return res.status(400).json({ success: false, message: 'Estado inválido' });
    }
    const { page, limit, offset } = leerPaginacion(req.query);
    const { extraWhere, vals } = leerFiltros(req.query);
    const [totalRows] = await db.query(
      `SELECT COUNT(*) AS total FROM reporte r WHERE r.id_estado = ?${extraWhere}`,
      [idEstado, ...vals]
    );
    const [reporte] = await db.query(`
      SELECT
        r.*,
        CONCAT(e.nombres,' ',e.apellido_paterno,' ',e.apellido_materno) AS estudiante,
        e.escuela AS carrera,
        es.nombre AS estado,
        tp.nombre AS tipo_problema,
        u.nombre AS ubicacion
      FROM reporte r
      INNER JOIN estudiante e ON r.codigo_estudiante = e.codigo
      INNER JOIN estado es ON r.id_estado = es.id_estado
      INNER JOIN tipo_problema tp ON r.id_tipo_problema = tp.id_tipo_problema
      INNER JOIN ubicacion u ON r.id_ubicacion = u.id_ubicacion
      WHERE r.id_estado = ?${extraWhere}
      ORDER BY r.fecha_edicion DESC
      LIMIT ? OFFSET ?
    `, [idEstado, ...vals, limit, offset]);
    return res.status(200).json({
      success: true,
      count: reporte.length,
      total: totalRows[0].total,
      page,
      limit,
      data: reporte
    });
  } catch (error) {
    console.error('Error al obtener reportes por id_estado:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener reportes por id estado'
    });
  }
};

const obtenerReportesPorCantidadReacciones = async (req, res) => {
  try {
    const estado = 'Aceptado';
    const { page, limit, offset } = leerPaginacion(req.query);
    const { extraWhere, vals } = leerFiltros(req.query);
    const [totalRows] = await db.query(
      `SELECT COUNT(*) AS total
       FROM reporte r
       INNER JOIN estado es ON r.id_estado = es.id_estado
       WHERE es.nombre = ?${extraWhere}`,
      [estado, ...vals]
    );
    const [reportes] = await db.query(`
      SELECT
        r.*,
        CONCAT(e.nombres,' ',e.apellido_paterno,' ',e.apellido_materno) AS estudiante,
        e.escuela AS carrera,
        es.nombre AS estado,
        tp.nombre AS tipo_problema,
        u.nombre AS ubicacion
      FROM reporte r
      INNER JOIN estudiante e ON r.codigo_estudiante = e.codigo
      INNER JOIN estado es ON r.id_estado = es.id_estado
      INNER JOIN tipo_problema tp ON r.id_tipo_problema = tp.id_tipo_problema
      INNER JOIN ubicacion u ON r.id_ubicacion = u.id_ubicacion
      WHERE es.nombre = ?${extraWhere}
      ORDER BY r.cantidad_reacciones DESC, r.fecha_edicion DESC
      LIMIT ? OFFSET ?
    `, [estado, ...vals, limit, offset]);
    if (reportes.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'No se encontraron reportes',
        count: 0,
        total: totalRows[0].total,
        page,
        limit,
        data: []
      });
    }
    res.status(200).json({
      success: true,
      message: 'Ranking de reportes por reacciones obtenido correctamente',
      count: reportes.length,
      total: totalRows[0].total,
      page,
      limit,
      data: reportes
    });
  } catch (error) {
    console.error('Error al obtener reportes por reacciones:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener reportes por reacciones' });
  }
};

const obtenerReportesPendientesPorIdEstudiante = async (req, res) => {
  try {
    // El alumno sale de la sesión (sin :id en la ruta, evita ver lo ajeno)
    const codigo_estudiante = req.session.auth.codigo_estudiante;
    const estado = 'Pendiente';
    const { page, limit, offset } = leerPaginacion(req.query);
    const { extraWhere, vals } = leerFiltros(req.query);
    const [totalRows] = await db.query(
      `SELECT COUNT(*) AS total
       FROM reporte r
       INNER JOIN estado es ON r.id_estado = es.id_estado
       WHERE es.nombre = ? AND r.codigo_estudiante = ?${extraWhere}`,
      [estado, codigo_estudiante, ...vals]
    );
    const [reportes] = await db.query(`
      SELECT
        r.*,
        CONCAT(e.nombres,' ',e.apellido_paterno,' ',e.apellido_materno) AS estudiante,
        e.escuela AS carrera,
        es.nombre AS estado,
        tp.nombre AS tipo_problema,
        u.nombre AS ubicacion
      FROM reporte r
      INNER JOIN estudiante e ON r.codigo_estudiante = e.codigo
      INNER JOIN estado es ON r.id_estado = es.id_estado
      INNER JOIN tipo_problema tp ON r.id_tipo_problema = tp.id_tipo_problema
      INNER JOIN ubicacion u ON r.id_ubicacion = u.id_ubicacion
      WHERE es.nombre = ? AND r.codigo_estudiante = ?${extraWhere}
      ORDER BY r.fecha_reporte DESC
      LIMIT ? OFFSET ?
    `, [estado, codigo_estudiante, ...vals, limit, offset]);
    if (reportes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron reportes pendientes para el estudiante'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Reportes pendientes obtenidos correctamente',
      count: reportes.length,
      total: totalRows[0].total,
      page,
      limit,
      data: reportes
    });
  } catch (error) {
    console.error('Error al obtener reportes pendientes:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener los reportes pendientes' });
  }
};

const obtenerReportesPorIdEstudiante = async (req, res) => {
  try {
    // El alumno sale de la sesión (sin :id en la ruta, evita ver lo ajeno)
    const codigo_estudiante = req.session.auth.codigo_estudiante;
    const { page, limit, offset } = leerPaginacion(req.query);
    const { extraWhere, vals } = leerFiltros(req.query);
    const [totalRows] = await db.query(
      `SELECT COUNT(*) AS total FROM reporte r WHERE r.codigo_estudiante = ?${extraWhere}`,
      [codigo_estudiante, ...vals]
    );
    const [reportes] = await db.query(`
      SELECT
        r.*,
        CONCAT(e.nombres,' ',e.apellido_paterno,' ',e.apellido_materno) AS estudiante,
        e.escuela AS carrera,
        es.nombre AS estado,
        tp.nombre AS tipo_problema,
        u.nombre AS ubicacion
      FROM reporte r
      INNER JOIN estudiante e ON r.codigo_estudiante = e.codigo
      INNER JOIN estado es ON r.id_estado = es.id_estado
      INNER JOIN tipo_problema tp ON r.id_tipo_problema = tp.id_tipo_problema
      INNER JOIN ubicacion u ON r.id_ubicacion = u.id_ubicacion
      WHERE r.codigo_estudiante = ?${extraWhere}
      ORDER BY r.fecha_reporte DESC
      LIMIT ? OFFSET ?
    `, [codigo_estudiante, ...vals, limit, offset]);
    if (reportes.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'No se encontraron reportes para el estudiante',
        total: totalRows[0].total,
        page,
        limit,
        data: []
      });
    }
    res.status(200).json({
      success: true,
      message: 'Reportes obtenidos correctamente',
      count: reportes.length,
      total: totalRows[0].total,
      page,
      limit,
      data: reportes
    });
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener los pendientes' });
  }
};

const obtenerReportesPorTipoProblema = async (req, res) => {
  try {
    const [resultados] = await db.query(`
      SELECT 
        tp.id_tipo_problema,
        tp.nombre AS tipo_problema,
        COUNT(r.id_reporte) AS total_reportes
      FROM tipo_problema tp
      LEFT JOIN reporte r 
        ON r.id_tipo_problema = tp.id_tipo_problema
      GROUP BY 
        tp.id_tipo_problema,
        tp.nombre
      ORDER BY total_reportes DESC
    `);
    return res.status(200).json({
      success: true,
      message: 'Estadística de reportes por tipo de problema obtenida correctamente',
      data: resultados
    });
  } catch (error) {
    console.error('Error al obtener estadística por tipo de problema:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener la estadística de reportes'
    });
  }
};

const obtenerReportesPorUbicacion = async (req, res) => {
  try {
    const [resultados] = await db.query(`
      SELECT 
        u.id_ubicacion,
        u.nombre AS ubicacion,
        COUNT(r.id_reporte) AS total_reportes
      FROM ubicacion u
      LEFT JOIN reporte r 
        ON r.id_ubicacion = u.id_ubicacion
      GROUP BY 
        u.id_ubicacion,
        u.nombre
      ORDER BY total_reportes DESC
    `);
    return res.status(200).json({
      success: true,
      message: 'Estadística de reportes por ubicación obtenida correctamente',
      data: resultados
    });
  } catch (error) {
    console.error('Error al obtener estadística por ubicación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener la estadística por ubicación'
    });
  }
};

const obtenerReportesPorTipoYUbicacion = async (req, res) => {
  try {
    const [resultados] = await db.query(`
      SELECT
        u.id_ubicacion,
        u.nombre AS ubicacion,
        tp.id_tipo_problema,
        tp.nombre AS tipo_problema,
        COUNT(r.id_reporte) AS total_reportes
      FROM reporte r
      INNER JOIN ubicacion u 
        ON r.id_ubicacion = u.id_ubicacion
      INNER JOIN tipo_problema tp 
        ON r.id_tipo_problema = tp.id_tipo_problema
      GROUP BY
        u.id_ubicacion,
        u.nombre,
        tp.id_tipo_problema,
        tp.nombre
      ORDER BY
        u.nombre,
        total_reportes DESC
    `);
    return res.status(200).json({
      success: true,
      message: 'Estadística de reportes por tipo de problema y ubicación obtenida correctamente',
      data: resultados
    });
  } catch (error) {
    console.error('Error al obtener estadística tipo vs ubicación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener la estadística tipo de problema vs ubicación'
    });
  }
};

const obtenerReportesPorMes = async (req, res) => {
  try {
    const [resultados] = await db.query(`
      SELECT
          t.anio,
          t.mes_numero,
          DATE_FORMAT(
              STR_TO_DATE(CONCAT(t.anio, '-', t.mes_numero, '-01'), '%Y-%m-%d'),
              '%M'
          ) AS mes_nombre,
          COUNT(*) AS total_reportes
      FROM (
          SELECT
              YEAR(fecha_reporte) AS anio,
              MONTH(fecha_reporte) AS mes_numero
          FROM reporte
      ) t
      GROUP BY
          t.anio,
          t.mes_numero
      ORDER BY
          t.anio,
          t.mes_numero
    `);
    return res.status(200).json({
      success: true,
      message: 'Estadística de reportes por mes obtenida correctamente',
      data: resultados
    });
  } catch (error) {
    console.error('Error al obtener reportes por mes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener la estadística de reportes por mes'
    });
  }
};

module.exports = {
  upload,
  crearReporte,
  actualizarReporte,
  obtenerReportePorId,
  obtenerReportesPorIdEstado,
  obtenerReportesPorCantidadReacciones,
  obtenerReportesPendientesPorIdEstudiante,
  obtenerReportesPorIdEstudiante,
  revisarReporte,
  eliminarReporte,
  obtenerReportesPorTipoProblema,
  obtenerReportesPorUbicacion,
  obtenerReportesPorTipoYUbicacion,
  obtenerReportesPorMes
};
