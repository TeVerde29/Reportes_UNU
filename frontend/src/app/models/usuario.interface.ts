export interface Usuario {
    id_usuario: number | null;
    codigo?: string;
    clave?: string;
    id_rol: number;
    id_trabajador?: number | null;
    // Solo viven en sesión (no hay fila `usuario` para alumno):
    id_estudiante?: number | null;
    codigo_estudiante?: string | null;
}

export interface UsuarioResponse {
    success: boolean;
    message: string;
    data?: Usuario;
}
