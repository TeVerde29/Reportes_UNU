
export interface EstadisticaPorTipoProblema {
  id_tipo_problema: number;
  tipo_problema: string;
  total_reportes: number;
}

export interface EstadisticaPorUbicacion {
  id_ubicacion: number;
  ubicacion: string;
  total_reportes: number;
}

export interface EstadisticaTipoProblemaUbicacion {
  id_ubicacion: number;
  ubicacion: string;
  id_tipo_problema: number;
  tipo_problema: string;
  total_reportes: number;
}

export interface EstadisticaPorMes {
  anio: number;
  mes_numero: number;
  mes_nombre: string;
  total_reportes: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  count?: number;
}

