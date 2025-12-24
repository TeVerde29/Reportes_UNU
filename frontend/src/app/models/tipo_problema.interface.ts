export interface TipoProbelma {
    id_tipo_problema: number;
    nombre: string;
}

export interface TipoProbelmaResponse {
    success: boolean;
    message: string;
    count?: number;
    data?: TipoProbelma | TipoProbelma [];
}
