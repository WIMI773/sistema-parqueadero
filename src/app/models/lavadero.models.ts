// models/lavadero.models.ts

export interface ServicioLavado {
  id: string;
  nombre: string;
  precio: number;
  duracionEstimada: number; // en minutos
  descripcion: string;
  preciosPorTipo?: {
    moto: number;
    auto: number;
    camion: number;
  };
}

export interface RegistroLavado {
  id: string;
  placa: string;
  tipoVehiculo: 'auto' | 'moto' | 'camion';
  servicios: ServicioLavado[];
  precioTotal: number;
  estado: 'espera' | 'proceso' | 'completado' | 'entregado';
  horaEntrada: Date;
  horaInicio?: Date;
  horaCompletado?: Date;
  horaSalida?: Date;
  observaciones?: string;
  codigoBarras?: string;
  pagado: boolean;
}

export interface ConfiguracionLavadero {
  serviciosDisponibles: ServicioLavado[];
  horaApertura: string;
  horaCierre: string;
}

export interface EstadisticasLavadero {
  serviciosEnEspera: number;
  serviciosEnProceso: number;
  serviciosCompletados: number;
  serviciosEntregados: number;
  totalRecaudado: number;
  ingresoPromedio: number;
  serviciosHoy: number;
}