// ============================================================
// PUERTA 2: ¿tienes el rol permitido? (qué puedes hacer)
// Guía: se pone DESPUÉS de requireSession.
// Roles: 1 = Supervisor, 2 = Administrador (en tabla `usuario`),
//        3 = Estudiante (solo vive en sesión, sin fila en `usuario`).
// Ejemplo: requireRole([1, 2]) solo personal.
// Para alumno se usa requireEstudiante (revisa su código, no su rol).
// ============================================================
const requireRole = (rolesPermitidos = []) => {
    return (req, res, next) => {
        // Primero revisa que exista sesión (por si se olvidó poner requireSession antes)
        const auth = req.session && req.session.auth;
        if (!auth) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
        }
        // Luego revisa el número de rol que guardó el login
        if (!rolesPermitidos.includes(auth.id_rol)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso (rol no autorizado)'
            });
        }
        next(); // rol correcto, pasa al controlador
    };
};

module.exports = requireRole;
