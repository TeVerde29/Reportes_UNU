// ============================================================
// PUERTA ESTUDIANTE: ¿la sesión es de un alumno? (sin fila en `usuario`)
// Guía: el login de alumno guarda solo sesión {id_rol: 3,
// codigo_estudiante}. No existe `usuario` rol 3 en la BD.
// Se usa en crear/editar reporte y likes, igual que requireRole.
/// ============================================================
const requireEstudiante = (req, res, next) => {
    const auth = req.session && req.session.auth;
    if (!auth) {
        return res.status(401).json({
            success: false,
            message: 'No autenticado'
        });
    }
    // El alumno se reconoce por su código del API (no por usuario)
    if (!auth.codigo_estudiante) {
        return res.status(403).json({
            success: false,
            message: 'Solo estudiantes'
        });
    }
    next(); // es alumno, pasa al controlador
};

module.exports = requireEstudiante;
