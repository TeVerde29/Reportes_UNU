export interface Ubicacion {
    id_estado: number;
    nombre: string;
}

export interface UbicacionResponse {
    success: boolean;
    message: string;
    data?: Ubicacion | Ubicacion [];
}
