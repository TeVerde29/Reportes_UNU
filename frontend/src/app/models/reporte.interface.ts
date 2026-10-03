export interface Reporte {
    id_reporte: number;
    titulo?: string;
    descripcion?: string;
    foto_url?: string;
    fecha_reporte?: string;
    fecha_edicion?: string;
    cantidad_reacciones?: number;
    codigo_estudiante?: string;
    id_estado?: number;
    id_tipo_problema?: number;
    id_ubicacion?: number;
    id_usuario?: number;
    estudiante?: string;
    carrera?: string;
    estado?: string;
    tipo_problema?: string;
    ubicacion?: string;
}

export interface ReporteResponse {
    success: boolean;
    message: string;
    count?: number;
    total?: number;
    page?: number;
    limit?: number;
    data?: Reporte | Reporte [];
}

export interface FiltrosReporte {
  page?: number;
  limit?: number;
  id_tipo_problema?: number | null;
  id_ubicacion?: number | null;
  q?: string;
}
