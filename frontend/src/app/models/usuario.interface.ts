export interface Usuario {
    id_usuario: number;
    id_rol: number; 
    id_estudiante?: number; // puede ser null si es admin
}

export interface UsuarioResponse {
    success: boolean;
    message: string;
    data?: Usuario;
}
