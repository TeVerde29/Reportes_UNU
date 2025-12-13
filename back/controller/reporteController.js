const db = require('../config/database');

const obtenerReportes = async (req, res) => {
    try {
        const [reportes] = await db.query(`
            SELECT r.*
            FROM reporte r
            ORDER BY r.fecha_edicion DESC
        `);
        if (reportes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron reportes'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Reportes obtenidos correctamente',
            count: reportes.length,
            data: reportes
        });
    } catch (error) {
        console.error('Error al obtener reportes:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener reportes'
        });
    }
};

const crearReporte = async (req, res) => {
    try {
        const { titulo, descripcion, foto_url, fecha_reporte, fecha_edicion, cantidad_reacciones, id_estado, id_estudiante, id_tipo_problema, id_ubicacion } = req.body;
        if (!titulo || !descripcion || !foto_url || !fecha_reporte || !fecha_edicion || !cantidad_reacciones || !id_estado || !id_estudiante || !id_tipo_problema || !id_ubicacion ) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos obligatorios'
            });
        }
        const [reporte] = await db.query(`
            INSERT INTO reporte(titulo, descripcion, foto_url, fecha_reporte, fecha_edicion, cantidad_reacciones, id_estado, id_estudiante, id_tipo_problema, id_ubicacion) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
            [titulo, descripcion, foto_url, fecha_reporte, fecha_edicion, cantidad_reacciones, id_estado, id_estudiante, id_tipo_problema, id_ubicacion]
        );
        res.status(201).json({
            success: true,
            message: 'Reporte creado exitosamente',
            data: { 
                id: reporte.insertId, 
                titulo, 
                descripcion, 
                foto_url, 
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
        console.error('Error al crear reporte');
        res.status(500).json({
            success: false,
            message: 'Error al crear reporte',
            error: error.message
        });
    }
};

const actualizarReporte = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion, foto_url, fecha_reporte, fecha_edicion, cantidad_reacciones, id_estado, id_estudiante, id_tipo_problema, id_ubicacion } = req.body;
        const [existe] = await db.query(`
            SELECT * FROM reporte WHERE id_reporte = ?`, [id]
        );
        if (existe.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }
        if (!titulo || !descripcion || !foto_url || !fecha_reporte || !fecha_edicion || cantidad_reacciones == null || id_estado == null || id_estudiante == null || id_tipo_problema == null || id_ubicacion == null) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos obligatorios'
            });
        }
    await db.query(`
        UPDATE reporte 
        SET titulo = ?, descripcion = ?, foto_url = ?, fecha_reporte = ?, fecha_edicion = ?, cantidad_reacciones = ?, id_estado = ?, id_estudiante = ?, id_tipo_problema = ?, id_ubicacion = ?
        WHERE id_reporte = ?
        `, [titulo, descripcion, foto_url, fecha_reporte, fecha_edicion, cantidad_reacciones, id_estado, id_estudiante, id_tipo_problema, id_ubicacion, id]
    );
        return res.status(200).json({
            success: true,
            message: 'Reporte actualizado correctamente'
        });
    } catch (error) {
        console.error('Error al actualizar reporte');
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
            SELECT r.*  FROM reporte r WHERE r.id_reporte = ?`, [id]
        );
        if (reportes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Reporte obtenido correctamente',
            data: reportes[0]   // ← un solo objeto
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
            SELECT r.* FROM reporte r WHERE r.id_estado = ?`, [id]
        );
        if (reporte.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron reportes para el estado indicado'
            });
        }
        return res.status(200).json({
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

const obtenerReportePorMayorReacciones = async (req, res) => {
    try {
        const [reportes] = await db.query(`
            SELECT * FROM reporte ORDER BY cantidad_reacciones DESC`
        );
        if (reportes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron reportes'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Reporte con mayor cantidad de reacciones obtenido correctamente',
            count: reportes.length,
            data: reportes[0]
        });
    } catch (error) {
        console.error('Error al obtener el reporte con mayor reacciones:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el reporte con mayor reacciones'
        });
    }
};

module.exports = {
    obtenerReportes,
    crearReporte,
    actualizarReporte,
    obtenerReportesPorIdEstado,
    obtenerReportePorMayorReacciones
};
