export interface Ubicacion {
    id_estado: number;
    nombre: string;
    tipo_ubicacion: string;
}

export interface UbicacionResponse {
    success: boolean;
    message: string;
    data?: Ubicacion | Ubicacion [];
}
