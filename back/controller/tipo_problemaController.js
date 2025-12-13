const db = require('../config/database');

const obtenerTiposProblema = async (req, res) => {
    try {
        const [tiposProblema] = await db.query(`SELECT * FROM tipo_problema`);
        if (tiposProblema.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron tipos de problema'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Tipos de problema obtenidos correctamente',
            count: tiposProblema.length,
            data: tiposProblema
        });
    } catch (error) {
        console.error('Error al obtener tipos de problema:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener tipos de problema'
        });
    }
};

module.exports = {
    obtenerTiposProblema
};
