export interface Estudiante {
    id_estudiante: number;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    dni: string;
    telefono: string;
    correo: string;
    escuela: string;
    facultad: string;
    codigo?: string;
    clave?: string;
}

export interface EstudianteResponse {
    success: boolean;
    message: string;
    data?: Estudiante | Estudiante[];
}
