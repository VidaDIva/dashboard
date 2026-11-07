export interface Medicion {
  id: number;
  estado: string;
  aceleracionX: number;
  aceleracionY: number;
  aceleracionZ: number;
  frecuencia: number;
  rms: number;
  inclinacion: number;
  vibracion: number;
  umbral: number;
  indiceAnomalia: number;
  fechaRegistro: string;
}

export interface Resumen {
  total: number;
  normales: number;
  precaucion: number;
  anomalas: number;
}

export interface MensajeWebSocket {
  tipo?: string;
  datos?: Medicion;
}

export interface PaginaMediciones {
  content?: Medicion[];
  totalPages?: number;
  totalElements?: number;
}

export interface Recomendacion {
  id: number;
  dispositivo: string;
  severidad: string;
  titulo: string;
  recomendacion: string;
  metrica: string | null;
  indice: number | null;
  fechaRegistro: string;
}

export interface AsistenteResumen {
  total: number;
  precaucion: number;
  anomalas: number;
}

export interface AsistenteEstado {
  humor: string;
  nivel: string;
  mensaje: string;
  recomendacion: string;
  ultimaRecomendacion: Recomendacion | null;
  resumen: AsistenteResumen;
  estadoMedicion: string;
}

export interface PaginaRecomendaciones {
  content?: Recomendacion[];
  totalPages?: number;
  totalElements?: number;
}
