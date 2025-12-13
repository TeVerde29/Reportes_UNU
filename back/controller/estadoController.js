const db = require('../config/database');

const obtenerEstados = async (req, res) => {
    try {
        const [estados] = await db.query(`SELECT * FROM estado`);
        if (estados.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron tipos de problema'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Tipos de problema obtenidos correctamente',
            count: estados.length,
            data: estados
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
    obtenerEstados
};
