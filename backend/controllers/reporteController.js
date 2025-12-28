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
  destination: function (req, file, cb) {
    const uploadPath = path.join('C:', 'Reportes_UNU_IMG', 'uploads', 'reportes');
    console.log('GUARDANDO EN =>', uploadPath);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
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
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)'));
    }
  }
});

const crearReporte = async (req, res) => {
    try {
        const { titulo, descripcion, id_estado, id_estudiante, id_tipo_problema, id_ubicacion } = req.body;
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se recibió ninguna imagen'
            });
        }
        if (!titulo || id_estado == null || id_estudiante == null || id_tipo_problema == null || id_ubicacion == null) {
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'Faltan datos obligatorios'
            });
        }
        const fotoUrl = `/uploads/reportes/${req.file.filename}`;
        const descripcionFinal = descripcion ?? null;
        const [reporte] = await db.query(`
            INSERT INTO reporte(titulo, descripcion, foto_url, fecha_reporte, fecha_edicion, cantidad_reacciones, id_estado, id_estudiante, id_tipo_problema, id_ubicacion) 
            VALUES (?, ?, ?, NOW(), NOW(), 0, ?, ?, ?, ?)`, 
            [titulo, descripcionFinal, fotoUrl, id_estado, id_estudiante, id_tipo_problema, id_ubicacion]
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
    try {
        const { id } = req.params;
        const { titulo, descripcion, fecha_reporte, fecha_edicion, cantidad_reacciones, id_estado, id_estudiante, id_tipo_problema, id_ubicacion } = req.body;
        const [existe] = await db.query(`SELECT foto_url FROM reporte WHERE id_reporte = ?`, [id]);
        if (existe.length === 0) {
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }
        if (!titulo || !fecha_reporte || !fecha_edicion || cantidad_reacciones == null || id_estado == null || id_estudiante == null || id_tipo_problema == null || id_ubicacion == null) {
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'Faltan datos obligatorios'
            });
        }
        const descripcionFinal = descripcion ?? null;
        let fotoUrl;
        if (req.file) {
            fotoUrl = `/uploads/reportes/${req.file.filename}`;
            const fotoAnterior = existe[0].foto_url;
            if (fotoAnterior) {
                const rutaAnterior = path.join(__dirname, '../../', fotoAnterior);
                if (fs.existsSync(rutaAnterior)) {
                    try {
                        fs.unlinkSync(rutaAnterior);
                    } catch (err) {
                        console.error('Error al eliminar foto anterior:', err);
                    }
                }
            }
        } else {
            fotoUrl = existe[0].foto_url;
        }
        await db.query(`
            UPDATE reporte 
            SET titulo = ?, descripcion = ?, foto_url = ?, fecha_reporte = ?, fecha_edicion = ?, cantidad_reacciones = ?, id_estado = ?, id_estudiante = ?, id_tipo_problema = ?, id_ubicacion = ?
            WHERE id_reporte = ?
            `, [titulo, descripcionFinal, fotoUrl, fecha_reporte, fecha_edicion, cantidad_reacciones, id_estado, id_estudiante, id_tipo_problema, id_ubicacion, id]
        );
        res.status(200).json({
            success: true,
            message: 'Reporte actualizado correctamente',
            data: {
                id,
                titulo,
                descripcion: descripcionFinal,
                foto_url: fotoUrl,
                fecha_reporte,
                fecha_edicion,
                cantidad_reacciones,
                id_estado,
                id_estudiante,
                id_tipo_problema,
                id_ubicacion
            }
        });
    } catch (error) {
        console.error('Error al actualizar reporte:', error);
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error al eliminar archivo:', unlinkError);
            }
        }
        res.status(500).json({
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
            c.nombre AS carrera,
            es.nombre AS estado,
            tp.nombre AS tipo_problema,
            u.nombre AS ubicacion
            FROM reporte r
            INNER JOIN estudiante e ON r.id_estudiante = e.id_estudiante
            INNER JOIN carrera c ON e.id_carrera = c.id_carrera
            INNER JOIN estado es ON r.id_estado = es.id_estado
            INNER JOIN tipo_problema tp ON r.id_tipo_problema = tp.id_tipo_problema
            INNER JOIN ubicacion u ON r.id_ubicacion = u.id_ubicacion
            WHERE r.id_reporte = ?
            `, [id]
        );
        if (reportes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Reporte obtenido correctamente',
            data: reportes[0]
        });
    } catch (error) {
        console.error('Error al obtener reporte por id:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener reporte por id'
        });
    }
};

const obtenerReportesPorIdEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const [reporte] = await db.query(`
            SELECT
            r.*,
            CONCAT(e.nombres,' ',e.apellido_paterno,' ',e.apellido_materno) AS estudiante,
            c.nombre AS carrera,
            es.nombre AS estado,
            tp.nombre AS tipo_problema,
            u.nombre AS ubicacion
            FROM reporte r
            INNER JOIN estudiante e ON r.id_estudiante = e.id_estudiante
            INNER JOIN carrera c ON e.id_carrera = c.id_carrera
            INNER JOIN estado es ON r.id_estado = es.id_estado
            INNER JOIN tipo_problema tp ON r.id_tipo_problema = tp.id_tipo_problema
            INNER JOIN ubicacion u ON r.id_ubicacion = u.id_ubicacion
            WHERE r.id_estado = ?
            ORDER BY r.fecha_edicion DESC
            `, [id]
        );
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
        return res.status(500).json({
            success: false,
            message: 'Error al obtener reportes por id_estado'
        });
    }
};

const obtenerReportesPorCantidadReacciones = async (req, res) => {
    try {
        const estado = 'Aceptado';
        const [reportes] = await db.query(`
            SELECT
            r.*,
            CONCAT(e.nombres,' ',e.apellido_paterno,' ',e.apellido_materno) AS estudiante,
            c.nombre AS carrera,
            es.nombre AS estado,
            tp.nombre AS tipo_problema,
            u.nombre AS ubicacion
            FROM reporte r
            INNER JOIN estudiante e ON r.id_estudiante = e.id_estudiante
            INNER JOIN carrera c ON e.id_carrera = c.id_carrera
            INNER JOIN estado es ON r.id_estado = es.id_estado
            INNER JOIN tipo_problema tp ON r.id_tipo_problema = tp.id_tipo_problema
            INNER JOIN ubicacion u ON r.id_ubicacion = u.id_ubicacion
            WHERE es.nombre = ?
            ORDER BY r.cantidad_reacciones DESC
            `, [estado]
        );
        if (reportes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron reportes'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Reporte con mayor cantidad de reacciones obtenido correctamente',
            count: reportes.length,
            data: reportes
        });
    } catch (error) {
        console.error('Error al obtener el reporte con mayor reacciones:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el reporte con mayor reacciones'
        });
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
            c.nombre AS carrera,
            tp.nombre AS tipo_problema,
            u.nombre AS ubicacion
            FROM reporte r
            INNER JOIN estudiante e ON r.id_estudiante = e.id_estudiante
            INNER JOIN carrera c ON e.id_carrera = c.id_carrera
            INNER JOIN estado es ON r.id_estado = es.id_estado
            INNER JOIN tipo_problema tp ON r.id_tipo_problema = tp.id_tipo_problema
            INNER JOIN ubicacion u ON r.id_ubicacion = u.id_ubicacion
            WHERE es.nombre = ? AND r.id_estudiante = ?
            ORDER BY r.fecha_reporte DESC
            `, [estado, id]
        );
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
        return res.status(500).json({
            success: false,
            message: 'Error al obtener los reportes pendientes'
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
    obtenerReportesPendientesPorIdEstudiante
};