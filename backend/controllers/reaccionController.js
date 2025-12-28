const db = require('../config/database');

const LikesActivosPorIdEstudiante = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'id_estudiante requerido' });
    }
    const [rows] = await db.query(
      `SELECT id_reporte
       FROM reaccion
       WHERE id_estudiante = ? AND \`like\` = 1`,
      [id]
    );
    return res.status(200).json({
      success: true,
      data: rows.map(r => r.id_reporte)
    });
  } catch (error) {
    console.error('Error en listarLikesActivosPorEstudiante:', error);
    return res.status(500).json({ success: false, message: 'Error al listar likes' });
  }
};

const darLike = async (req, res) => {
  const { id_estudiante, id_reporte } = req.body;
  if (!id_estudiante || !id_reporte) {
    return res.status(400).json({
      success: false,
      message: 'Datos incompletos'
    });
  }
  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();
    const [rows] = await conn.query(
      `SELECT id_reaccion, \`like\`
       FROM reaccion
       WHERE id_estudiante = ? AND id_reporte = ?
       FOR UPDATE`,
      [id_estudiante, id_reporte]
    );
    if (rows.length === 0) {
      await conn.query(
        `INSERT INTO reaccion (id_estudiante, id_reporte, \`like\`)
         VALUES (?, ?, 1)`,
        [id_estudiante, id_reporte]
      );
      const [upd] = await conn.query(
        `UPDATE reporte
         SET cantidad_reacciones = IFNULL(cantidad_reacciones, 0) + 1
         WHERE id_reporte = ?`,
        [id_reporte]
      );
      if (upd.affectedRows === 0) {
        await conn.rollback();
        return res.status(404).json({
          success: false,
          message: 'Reporte no encontrado'
        });
      }
      await conn.commit();
      return res.status(201).json({
        success: true,
        message: 'Like registrado'
      });
    }
    const actualLike = Number(rows[0].like);
    if (actualLike === 1) {
      await conn.commit();
      return res.status(200).json({
        success: true,
        message: 'Ya has dado like'
      });
    }
    await conn.query(
      `UPDATE reaccion
       SET \`like\` = 1
       WHERE id_reaccion = ?`,
      [rows[0].id_reaccion]
    );
    const [upd2] = await conn.query(
      `UPDATE reporte
       SET cantidad_reacciones = IFNULL(cantidad_reacciones, 0) + 1
       WHERE id_reporte = ?`,
      [id_reporte]
    );
    if (upd2.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }
    await conn.commit();
    return res.status(200).json({
      success: true,
      message: 'Like activado'
    });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error('Error en darLike:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al procesar like'
    });
  } finally {
    if (conn) conn.release();
  }
};

const quitarLike = async (req, res) => {
  const { id_estudiante, id_reporte } = req.body;
  if (!id_estudiante || !id_reporte) {
    return res.status(400).json({
      success: false,
      message: 'Datos incompletos'
    });
  }
  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();
    const [rows] = await conn.query(
      `SELECT id_reaccion, \`like\`
       FROM reaccion
       WHERE id_estudiante = ? AND id_reporte = ?
       FOR UPDATE`,
      [id_estudiante, id_reporte]
    );
    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({
        success: false,
        message: 'Reaccion no encontrada'
      });
    }
    const actualLike = Number(rows[0].like);
    if (actualLike === 0) {
      await conn.commit();
      return res.status(200).json({
        success: true,
        message: 'Like ya estaba desactivado'
      });
    }
    await conn.query(
      `UPDATE reaccion
       SET \`like\` = 0
       WHERE id_reaccion = ?`,
      [rows[0].id_reaccion]
    );
    const [upd] = await conn.query(
      `UPDATE reporte
       SET cantidad_reacciones = GREATEST(0, IFNULL(cantidad_reacciones, 0) - 1)
       WHERE id_reporte = ?`,
      [id_reporte]
    );
    if (upd.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }
    await conn.commit();
    return res.status(200).json({
      success: true,
      message: 'Like desactivado'
    });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error('Error en quitarLike:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar like'
    });
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  LikesActivosPorIdEstudiante,
  darLike,
  quitarLike
};