export interface Ubicacion {
    id_ubicacion: number;
    nombre: string;
}

export interface UbicacionResponse {
    success: boolean;
    message: string;
    data?: Ubicacion | Ubicacion [];
}
