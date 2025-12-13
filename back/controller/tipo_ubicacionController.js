const db = require('../config/database');

const obtenerTiposUbiacion = async (req, res) => {
    try {
        const [TiposUbiacion] = await db.query(`SELECT * FROM tipo_ubicacion`);
        if (TiposUbiacion.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron tipos de ubicacion'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Tipos de ubicacion obtenidos correctamente',
            count: TiposUbiacion.length,
            data: TiposUbiacion
        });
    } catch (error) {
        console.error('Error al obtener tipos de ubicacion:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener tipos de ubicacion'
        });
    }
};

module.exports = {
    obtenerTiposUbiacion
};
