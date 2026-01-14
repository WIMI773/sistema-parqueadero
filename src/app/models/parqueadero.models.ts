/**
 * Modelos de datos para el sistema de control de parqueadero
 */

export interface Vehiculo {
  id: string;
  placa: string;
  tipo: 'auto' | 'moto' | 'camion';
  propietario: string;
  telefono?: string;
  email?: string;
  activo: boolean;
}

export interface Registro {
  id: string;
  vehiculoId: string;
  placa: string;
  tipo: 'entrada' | 'salida';
  fecha: Date;
  horaEntrada?: Date;
  horaSalida?: Date;
  duracion?: number;
  tarifa?: number;
  pagado: boolean;

  // 🔥 NUEVO
  codigoBarras?: string;
}


export interface ConfiguracionParqueadero {
  cuposTotal: number;
  tarifaPorHora: number;
  tarifaMoto: number;
  tarifaCamion: number;
  horaApertura: string;
  horaCierre: string;
}

export interface EstadisticasParqueadero {
  vehiculosDentro: number;
  cuposDisponibles: number;
  cuposOcupados: number;
  totalRecaudado: number;
  totalEntradas: number;
  totalSalidas: number;
  ingresoPromedio: number;
}
