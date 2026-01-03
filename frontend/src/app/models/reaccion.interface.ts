export interface Reaccion {
    id_reaccion?: number;
    id_estudiante: number;
    id_reporte: number;
    like?: number;
}

export interface ReaccionResponse {
  success: boolean;
  message?: string;
  count?: number;
  data?: Reaccion | Reaccion[] | number[];
}
