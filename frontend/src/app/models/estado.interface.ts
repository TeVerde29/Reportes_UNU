export interface Estado {
    id_estado: number;
    nombre: string;
}

export interface EstadoResponse {
    success: boolean;
    message: string;
    count?: number;
    data?: Estado | Estado [];
}
