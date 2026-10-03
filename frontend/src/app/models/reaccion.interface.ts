export interface Reaccion {
    id_reaccion?: number;
    codigo_estudiante?: string;
    id_reporte: number;
    like?: number;
}

export interface ReaccionResponse {
  success: boolean;
  message?: string;
  count?: number;
  data?: Reaccion | Reaccion[] | number[];
}
