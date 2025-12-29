export interface Trabajador {
    id_Trabajador: number;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    dni: string;
    telefono: string;
    correo: string;
    activo: string;
}

export interface TrabajadorResponse {
    success: boolean;
    message: string;
    data?: Trabajador | Trabajador[];
}
