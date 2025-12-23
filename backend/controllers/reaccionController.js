const db = require('../config/database');

const darLike = async (req, res) => {
    try {
        const { id_estudiante, id_reporte } = req.body;
        if (!id_estudiante || !id_reporte) {
            return res.status(400).json({
                success: false,
                message: 'Datos incompletos'
            });
        }
        const [rows] = await db.query(
            `SELECT \`like\`
             FROM reaccion
             WHERE id_estudiante = ? AND id_reporte = ?`,
            [id_estudiante, id_reporte]
        );
        if (rows.length === 0) {
            await db.query(
                `INSERT INTO reaccion (id_estudiante, id_reporte, \`like\`)
                 VALUES (?, ?, 1)`,
                [id_estudiante, id_reporte]
            );
            return res.status(201).json({
                success: true,
                message: 'Like registrado'
            });
        }
        await db.query(
            `UPDATE reaccion
             SET \`like\` = 1
             WHERE id_estudiante = ? AND id_reporte = ?`,
            [id_estudiante, id_reporte]
        );
        return res.status(200).json({
            success: true,
            message: 'Like activado'
        });
    } catch (error) {
        console.error('Error en darLike:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al procesar like'
        });
    }
};

const quitarLike = async (req, res) => {
    try {
        const { id_estudiante, id_reporte } = req.body;
        const [existe] = await db.query(`
            SELECT 1 FROM reaccion WHERE id_estudiante = ? AND id_reporte = ?`
            , [id_estudiante, id_reporte]
        );
        if (existe.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reaccion no encontrada'
            });
        }
        if (!id_estudiante || !id_reporte) {
            return res.status(400).json({
                success: false,
                message: 'Datos incompletos'
            });
        }
        await db.query(
            `UPDATE reaccion
             SET \`like\` = 0
             WHERE id_estudiante = ? AND id_reporte = ?`,
            [id_estudiante, id_reporte]
        );
        return res.status(200).json({
            success: true,
            message: 'Like desactivado'
        });
    } catch (error) {
        console.error('Error al quitar like:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar like'
        });
    }
};

module.exports = {
    darLike,
    quitarLike
};
