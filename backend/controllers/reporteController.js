const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');

function generarCodigoSeguro() {
  const U = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const L = "abcdefghijklmnopqrstuvwxyz";
  const D = "0123456789";
  const S = "-_";
  const all = U + L + D + S;
  let codigo = '';
  for (let i = 0; i < 16; i++) {
    codigo += all.charAt(Math.floor(Math.random() * all.length));
  }
  return codigo;
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) { // ESTO ES PARA GUARDAR LA IMAGEN EN ESA RUTA
    const uploadPath = path.join('C:', 'Reportes_UNU_IMG', 'uploads', 'reportes');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) { // ESTO ES COMO SE LLAMARA LA IMG GUARDADA
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
    const allowedMimes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];
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
        const { titulo, descripcion, id_estudiante, id_tipo_problema, id_ubicacion } = req.body;
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se recibió ninguna imagen'
            });
        }
        if (!titulo || !descripcion || id_estudiante == null || id_tipo_problema == null || id_ubicacion == null) {
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'Faltan datos obligatorios'
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
            INSERT INTO reporte(titulo, descripcion, foto_url, fecha_reporte, fecha_edicion, cantidad_reacciones, id_estado, id_estudiante, id_tipo_problema, id_ubicacion) 
            VALUES (?, ?, ?, NOW(), NOW(), 0, ?, ?, ?, ?)`, 
            [titulo, descripcion, fotoUrl, id_estado, id_estudiante, id_tipo_problema, id_ubicacion]
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
  // Para rollback de imagen si la BD falla
  let backupPath = null;
  let targetPath = null;

  const safeUnlink = (p) => {
    try {
      if (p && fs.existsSync(p)) fs.unlinkSync(p);
    } catch (e) {
      console.error('Error al eliminar archivo:', e);
    }
  };

  const restoreBackup = () => {
    try {
      // Si ya se puso la nueva imagen, se borra
      if (targetPath && fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
      // Si existe backup, se restaura
      if (backupPath && fs.existsSync(backupPath) && targetPath) fs.renameSync(backupPath, targetPath);
    } catch (e) {
      console.error('Error al restaurar backup de imagen:', e);
    }
  };

  try {
    const { id } = req.params;
    const { titulo, descripcion, fecha_edicion, id_estado, id_tipo_problema, id_ubicacion, id_usuario } = req.body;
    if (!titulo || !descripcion || !fecha_edicion || id_estado == null || id_tipo_problema == null || id_ubicacion == null || id_usuario == null) {
      if (req.file && req.file.path) safeUnlink(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Faltan datos obligatorios'
      });
    }
    if (req.file && req.file.path) {
      const [rowsFoto] = await db.query(
        "SELECT foto_url FROM reporte WHERE id_reporte = ? LIMIT 1",
        [id]
      );
      if (!rowsFoto || rowsFoto.length === 0) {
        safeUnlink(req.file.path);
        return res.status(404).json({
          success: false,
          message: 'Reporte no encontrado'
        });
      }
      const fotoUrlActual = rowsFoto[0].foto_url; // ej: "/uploads/reportes/AbC123.webp"
      if (!fotoUrlActual) {
        safeUnlink(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'El reporte no tiene foto_url registrada'
        });
      }
      const filenameActual = path.basename(fotoUrlActual);      // "AbC123.webp"
      const extActual = path.extname(filenameActual).toLowerCase(); // ".webp"
      const extNueva = path.extname(req.file.filename).toLowerCase(); // ext del archivo subido
      if (extNueva !== extActual) {
        safeUnlink(req.file.path);
        return res.status(400).json({
          success: false,
          message: `La nueva imagen debe tener la misma extensión que la actual: ${extActual}`
        });
      }
      const uploadDir = path.join('C:', 'Reportes_UNU_IMG', 'uploads', 'reportes');
      targetPath = path.join(uploadDir, filenameActual);
      if (fs.existsSync(targetPath)) {
        backupPath = `${targetPath}.bak_${Date.now()}`;
        fs.renameSync(targetPath, backupPath);
      }
      fs.renameSync(req.file.path, targetPath);
    }
    await db.query(`
      UPDATE reporte 
      SET titulo = ?, descripcion = ?, fecha_edicion = ?, id_estado = ?, id_tipo_problema = ?, id_ubicacion = ?, id_usuario = ?
      WHERE id_reporte = ?
    `, [titulo, descripcion, fecha_edicion, id_estado, id_tipo_problema, id_ubicacion, id_usuario, id]);
    if (backupPath) safeUnlink(backupPath);
    const [reporte] = await db.query(
      `SELECT * FROM reporte WHERE id_reporte = ?`,
      [id]
    );
    return res.status(200).json({
      success: true,
      message: 'Reporte actualizado correctamente',
      data: reporte[0]
    });
  } catch (error) {
    console.error('Error al actualizar reporte:', error);
    if (backupPath || targetPath) {
      restoreBackup();
      if (backupPath) safeUnlink(backupPath);
    }
    if (req.file && req.file.path) safeUnlink(req.file.path);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar reporte'
    });
  }
};

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
      INNER JOIN estudiante e ON r.id_estudiante = e.id_estudiante
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
    const [reporte] = await db.query(`
      SELECT
        r.*,
        CONCAT(e.nombres,' ',e.apellido_paterno,' ',e.apellido_materno) AS estudiante,
        e.escuela AS carrera,
        es.nombre AS estado,
        tp.nombre AS tipo_problema,
        u.nombre AS ubicacion
      FROM reporte r
      INNER JOIN estudiante e ON r.id_estudiante = e.id_estudiante
      INNER JOIN estado es ON r.id_estado = es.id_estado
      INNER JOIN tipo_problema tp ON r.id_tipo_problema = tp.id_tipo_problema
      INNER JOIN ubicacion u ON r.id_ubicacion = u.id_ubicacion
      WHERE r.id_estado = ?
      ORDER BY r.fecha_edicion DESC
    `, [id]);
    if (reporte.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron reportes para el estado indicado'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Reportes obtenidos correctamente',
      count: reporte.length,
      data: reporte
    });
  } catch (error) {
    console.error('Error al obtener reportes por id_estado:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener reportes por id_estado' });
  }
};

const obtenerReportesPorCantidadReacciones = async (req, res) => {
  try {
    const estado = 'Aceptado';
    const [reportes] = await db.query(`
      SELECT
        r.*,
        CONCAT(e.nombres,' ',e.apellido_paterno,' ',e.apellido_materno) AS estudiante,
        e.escuela AS carrera,
        es.nombre AS estado,
        tp.nombre AS tipo_problema,
        u.nombre AS ubicacion
      FROM reporte r
      INNER JOIN estudiante e ON r.id_estudiante = e.id_estudiante
      INNER JOIN estado es ON r.id_estado = es.id_estado
      INNER JOIN tipo_problema tp ON r.id_tipo_problema = tp.id_tipo_problema
      INNER JOIN ubicacion u ON r.id_ubicacion = u.id_ubicacion
      WHERE es.nombre = ?
      ORDER BY r.cantidad_reacciones DESC, r.fecha_edicion DESC
    `, [estado]);
    if (reportes.length === 0) {
      return res.status(404).json({ success: false, message: 'No se encontraron reportes' });
    }
    res.status(200).json({
      success: true,
      message: 'Ranking de reportes por reacciones obtenido correctamente',
      count: reportes.length,
      data: reportes
    });
  } catch (error) {
    console.error('Error al obtener reportes por reacciones:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener reportes por reacciones' });
  }
};

const obtenerReportesPendientesPorIdEstudiante = async (req, res) => {
  try {
    const { id } = req.params;
    const estado = 'Pendiente';
    const [reportes] = await db.query(`
      SELECT
        r.*,
        CONCAT(e.nombres,' ',e.apellido_paterno,' ',e.apellido_materno) AS estudiante,
        e.escuela AS carrera,
        es.nombre AS estado,
        tp.nombre AS tipo_problema,
        u.nombre AS ubicacion
      FROM reporte r
      INNER JOIN estudiante e ON r.id_estudiante = e.id_estudiante
      INNER JOIN estado es ON r.id_estado = es.id_estado
      INNER JOIN tipo_problema tp ON r.id_tipo_problema = tp.id_tipo_problema
      INNER JOIN ubicacion u ON r.id_ubicacion = u.id_ubicacion
      WHERE es.nombre = ? AND r.id_estudiante = ?
      ORDER BY r.fecha_reporte DESC
    `, [estado, id]);
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
      data: reportes
    });
  } catch (error) {
    console.error('Error al obtener reportes pendientes:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener los reportes pendientes' });
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
};
