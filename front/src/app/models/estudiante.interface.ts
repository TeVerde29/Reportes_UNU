export interface Estudiante {
    id_estudiante: number;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    dni: string;
    id_carrera: number;
    carrera: string; // viene del INNER JOIN
}

export interface EstudianteResponse {
    success: boolean;
    message: string;
    data?: Estudiante;
}
