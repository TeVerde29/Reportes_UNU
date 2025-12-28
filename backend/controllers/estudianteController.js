const db = require('../config/database');

const obtenerEstudiantePorId = async (req, res) => {
    try {
        const { id } = req.params;
        const [estudiante] = await db.query(`
            SELECT * FROM estudiante WHERE id_estudiante = ?
            `, [id]
        );
        if (estudiante.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Estudiante encontrado',
            data: estudiante[0]
        });
    } catch (error) {
        console.error('Error al obtener estudiante:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener estudiante'
        });
    }
};
/*
const obtenerEstudiantePorIdUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const [estudiante] = await db.query(`
            SELECT e.*, c.nombre AS carrera
            FROM usuario u
            INNER JOIN estudiante e ON u.id_estudiante = e.id_estudiante
            INNER JOIN carrera c ON e.id_carrera = c.id_carrera
            WHERE u.id_usuario = ?
        `, [id]);
        if (estudiante.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Estudiante encontrado',
            data: estudiante[0]
        });
    } catch (error) {
        console.error('Error al obtener estudiante por id de usuario:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener estudiante'
        });
    }
};
*/
module.exports = {
    obtenerEstudiantePorId,
    // obtenerEstudiantePorIdUsuario
};
