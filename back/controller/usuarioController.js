const db = require('../config/database');
const bcrypt = require('bcrypt');

const VerificarUsuario = async (req, res) => {
    try {
        const { codigo, clave } = req.body;
        if (!codigo || !clave) {
            return res.status(400).json({
                success: false,
                message: 'Datos incompletos'
            });
        }
        const [rows] = await db.query(`
            SELECT id_usuario, rol, clave_hash 
            FROM usuario 
            WHERE codigo = ?
            `, [codigo]
        );
        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }
        const usuario = rows[0];
        const passwordValido = await bcrypt.compare(clave, usuario.clave_hash);
        if (!passwordValido) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Usuario autenticado',
            data: {
                id_usuario: usuario.id_usuario,
                id_rol: usuario.rol,
                id_estudiante: usuario.id_estudiante
            }
        });
    } catch (error) {
        console.error('[VerificarUsuario]', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

module.exports = {
    VerificarUsuario
};
