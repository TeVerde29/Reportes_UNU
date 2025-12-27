const db = require('../config/database');

const obtenerUbicaciones = async (req, res) => {
    try {
        const [ubicaciones] = await db.query(`SELECT * FROM ubicacion`);
        if (ubicaciones.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron ubicaciones'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Ubicaciones obtenidas correctamente',
            data: ubicaciones
        });
    } catch (error) {
        console.error('Error al obtener ubicaciones:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener ubicaciones'
        });
    }
};

const obtenerUbicacionesPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const [ubicaciones] = await db.query(`
            SELECT id_ubicacion, nombre
            FROM ubicacion
            WHERE id_ubicacion = ?
            `, [id]
        );
        if (ubicaciones.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró la ubicación'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Ubicación obtenida correctamente',
            data: ubicaciones[0]
        });
    } catch (error) {
        console.error('Error al obtener ubicación:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

/*
    const obtenerUbicacionesPorIdTipoUbicacion = async (req, res) => {
        try {
            const { id } = req.params;
            const [ubicaciones] = await db.query(`SELECT * FROM ubicacion WHERE id_tipo_ubicacion = ?`, [id]);
            if (ubicaciones.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No se encontraron ubicaciones'
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Ubicaciones obtenidas correctamente',
                count: ubicaciones.length,
                data: ubicaciones
            });
        } catch (error) {
            console.error('Error al obtener ubicaciones:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener ubicaciones'
            });
        }
    };
*/
module.exports = {
    obtenerUbicaciones,
    obtenerUbicacionesPorId
    //obtenerUbicacionesPorIdTipoUbicacion
};
