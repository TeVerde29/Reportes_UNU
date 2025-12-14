export interface TipoUbicacion {
    id_tipo_ubicacion: number;
    nombre: string;
}

export interface TipoUbicacionResponse {
    success: boolean;
    message: string;
    count?: number;
    data?: TipoUbicacion | TipoUbicacion [];
}
