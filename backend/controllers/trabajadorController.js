const db = require('../config/database');

const obtenerTrabajadorPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const [trabajador] = await db.query(`
            SELECT * FROM trabajador WHERE id_trabajador = ?
            `, [id]
        );
        if (trabajador.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'trabajador no encontrado'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'trabajador encontrado',
            data: trabajador[0]
        });
    } catch (error) {
        console.error('Error al obtener trabajador:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener trabajador'
        });
    }
};



module.exports = {
    obtenerTrabajadorPorId
};
