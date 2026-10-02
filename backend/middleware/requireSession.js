// ============================================================
// PUERTA 1: ¿tienes sesión? (loguado o no)
// Guía: se pone antes de la ruta. Si no hay cookie `sid` válida,
// responde 401 y no deja pasar al controlador.
// ============================================================
const requireSession = (req, res, next) => {
    // req.session.auth lo crea el login cuando la clave es correcta
    if (!req.session || !req.session.auth) {
        return res.status(401).json({
        success: false,
        message: 'No autenticado'
        });
    }
    next(); // sí hay sesión, pasa a la siguiente puerta o al controlador
};

module.exports = requireSession;
