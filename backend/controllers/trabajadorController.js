const db = require('../config/database');

const obtenerTrabajadorPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const auth = req.session && req.session.auth;
        // Propiedad: un trabajador solo ve su propio perfil; los roles 1 y 2
        // ven cualquiera; los alumnos no usan este endpoint (403)
        const esPersonal = auth && (auth.id_rol === 1 || auth.id_rol === 2);
        const esPropio = auth && Number(id) === Number(auth.id_trabajador);
        if (!esPersonal && !esPropio) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para ver este perfil'
            });
        }
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
