export interface Usuario {
    id_usuario: number;
    codigo?: string;
    clave?: string;
    id_rol: number; 
    id_estudiante?: number;
    id_trabajador?: number;
}

export interface UsuarioResponse {
    success: boolean;
    message: string;
    data?: Usuario;
}
