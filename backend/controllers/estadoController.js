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

const obtenerEstadoPorNombre = async (req, res) => {
  try {
    const { nombre } = req.params;
    const [estados] = await db.query(
      `SELECT * FROM estado e WHERE e.nombre = ?`,
      [nombre]
    );
    if (!estados || estados.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron estados'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Estados obtenidos correctamente',
      data: estados
    });
  } catch (error) {
    console.error('Error al obtener estados:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener estados',
    });
  }
};

module.exports = {
    obtenerEstados,
    obtenerEstadoPorNombre
};
