import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Vehiculo,
  Registro,
  EstadisticasParqueadero,
  ConfiguracionParqueadero
} from '../models/parqueadero.models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ParqueaderoService {

  private registros: Registro[] = [];
  private vehiculos: Vehiculo[] = [];
  private vehiculosDentro: Map<string, Registro> = new Map();

  private config: ConfiguracionParqueadero = {
    cuposTotal: 50,
    tarifaPorHora: 2000,    // Tarifa carros por hora
    tarifaMoto: 1000,        // Tarifa motos por hora
    tarifaCamion: 3000,     // Tarifa camiones por hora
    horaApertura: '06:00',
    horaCierre: '22:00'
  };

  private estadisticasSubject!: BehaviorSubject<EstadisticasParqueadero>;
  public estadisticas$!: Observable<EstadisticasParqueadero>;

  private storageKey = '';

  constructor(private authService: AuthService) {
    this.storageKey = this.getStorageKey();
    this.cargarDatosGuardados();

    this.estadisticasSubject = new BehaviorSubject(
      this.calcularEstadisticas()
    );
    this.estadisticas$ = this.estadisticasSubject.asObservable();
  }

  // ==================== REGISTROS ====================

  registrarEntrada(
  placa: string,
  tipoVehiculo: 'auto' | 'moto' | 'camion'
): Registro | null {
  
  if (this.vehiculosDentro.has(placa)) return null;
  // Cupos ilimitados - validación de cupos eliminada

  const codigoBarras = `PK-${Date.now()}-${placa}`;

  const registro: Registro = {
    id: this.generarId(),
    vehiculoId: tipoVehiculo,
    placa,
    tipo: 'entrada',
    fecha: new Date(),
    horaEntrada: new Date(),
    pagado: false,
    codigoBarras
  };

  this.registros.push(registro);
  this.vehiculosDentro.set(placa, registro);

  this.persistirCambios();
  return registro;
}

  obtenerTicketEntrada(registroId: string) {
    const registro = this.registros.find(
      r => r.id === registroId && r.tipo === 'entrada'
    );

    if (!registro) return null;

    return {
      parqueadero: 'ParkingHub',
      placa: registro.placa,
      tipoVehiculo: registro.vehiculoId,
      horaEntrada: registro.horaEntrada,
      codigoBarras: registro.codigoBarras,
      fecha: registro.fecha
    };
  }

  // 🆕 REGISTRAR SALIDA CON CÓDIGO DE BARRAS
  registrarSalidaPorCodigoBarras(codigoBarras: string): Registro | null {
    // Buscar el registro de entrada con ese código de barras
    const entrada = this.registros.find(
      r => r.tipo === 'entrada' && r.codigoBarras === codigoBarras
    );

    if (!entrada || !entrada.placa) {
      return null;
    }

    // Verificar que el vehículo todavía esté dentro
    if (!this.vehiculosDentro.has(entrada.placa)) {
      return null;
    }

    // Registrar la salida usando la placa
    return this.registrarSalida(entrada.placa);
  }

  registrarSalida(placa: string): Registro | null {
    const entrada = this.vehiculosDentro.get(placa);
    if (!entrada || !entrada.horaEntrada) return null;

    const horaSalida = new Date();
    const duracion = Math.ceil(
      (horaSalida.getTime() - entrada.horaEntrada.getTime()) / 60000
    );

    const tarifa = this.calcularTarifa(duracion, entrada.vehiculoId || placa);

    const registroSalida: Registro = {
      id: this.generarId(),
      vehiculoId: entrada.vehiculoId || placa,
      placa,
      tipo: 'salida',
      fecha: new Date(),
      horaEntrada: entrada.horaEntrada,
      horaSalida,
      duracion,
      tarifa,
      pagado: false,
      codigoBarras: entrada.codigoBarras
    };

    this.registros.push(registroSalida);
    this.vehiculosDentro.delete(placa);

    this.persistirCambios();
    return registroSalida;
  }

  obtenerHistorial(limite = 100): Registro[] {
    return [...this.registros]
      .sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha))
      .slice(0, limite);
  }

  obtenerVehiculosDentro() {
    const ahora = new Date();
    return Array.from(this.vehiculosDentro.values()).map(r => {
      const mins = Math.floor(
        (ahora.getTime() - (r.horaEntrada?.getTime() || 0)) / 60000
      );
      return {
        placa: r.placa,
        horaEntrada: r.horaEntrada || new Date(),
        duracion: this.formatearDuracion(mins)
      };
    });
  }

  registrarPago(registroId: string): boolean {
    const r = this.registros.find(x => x.id === registroId);
    if (!r) return false;

    r.pagado = true;
    this.persistirCambios();
    return true;
  }

  obtenerRegistroParaRecibo(registroId: string): any {
    const salida = this.registros.find(
      r => r.id === registroId && r.tipo === 'salida'
    );
    if (!salida) return null;

    const entrada = this.registros
      .filter(r => r.placa === salida.placa && r.tipo === 'entrada')
      .sort((a, b) =>
        +new Date(b.horaEntrada || 0) - +new Date(a.horaEntrada || 0)
      )[0];

    return {
      placa: salida.placa,
      horaEntrada: entrada?.horaEntrada || salida.horaEntrada,
      horaSalida: salida.horaSalida,
      duracion: salida.duracion,
      tarifa: salida.tarifa,
      pagado: salida.pagado,
      registroId: salida.id,
      fecha: salida.fecha,
      tipoVehiculo: this.obtenerTipoVehiculo(salida.vehiculoId || ''),
      codigoBarras: salida.codigoBarras || entrada?.codigoBarras
    };
  }

  // Obtener el nombre formateado del tipo de vehículo
  private obtenerTipoVehiculo(tipo: string): string {
    const tipos: any = {
      'auto': '🚗 Auto',
      'moto': '🏍️ Moto',
      'camion': '🚛 Camión'
    };
    return tipos[tipo] || tipo;
  }

  // ==================== CONFIG ====================

  obtenerConfiguracion(): ConfiguracionParqueadero {
    return { ...this.config };
  }

  actualizarConfiguracion(config: Partial<ConfiguracionParqueadero>) {
    this.config = { ...this.config, ...config };
    this.persistirCambios();
  }

  resetearDatos(): void {
    this.registros = [];
    this.vehiculosDentro.clear();

    localStorage.removeItem(this.storageKey);
    this.actualizarEstadisticas();
  }

  // ==================== INTERNOS ====================

  private persistirCambios() {
    this.guardarDatos();
    this.actualizarEstadisticas();
  }

  private actualizarEstadisticas() {
    this.estadisticasSubject.next(this.calcularEstadisticas());
  }

  private calcularEstadisticas(): EstadisticasParqueadero {
    const dentro = this.vehiculosDentro.size;
    const salidas = this.registros.filter(r => r.tipo === 'salida').length;
    const recaudado = this.registros
      .filter(r => r.pagado && r.tarifa)
      .reduce((s, r) => s + (r.tarifa || 0), 0);

    return {
      vehiculosDentro: dentro,
      cuposDisponibles: this.config.cuposTotal - dentro,
      cuposOcupados: dentro,
      totalEntradas: this.registros.filter(r => r.tipo === 'entrada').length,
      totalSalidas: salidas,
      totalRecaudado: recaudado,
      ingresoPromedio: salidas ? recaudado / salidas : 0
    };
  }

  private calcularTarifa(min: number, tipoVehiculo: string): number {
    const precios: any = {
      auto: this.config.tarifaPorHora,
      moto: this.config.tarifaMoto,
      camion: this.config.tarifaCamion
    };

    const tarifaPorHora = precios[tipoVehiculo] || this.config.tarifaPorHora;
    const fraccion = tarifaPorHora / 2; // Fracción adicional (50% de la tarifa por hora)

    // Calcular horas completas
    const horasCompletas = Math.floor(min / 60);
    const minutosRestantes = min % 60;

    let tarifa = 0;

    // Cobrar las horas completas
    if (horasCompletas > 0) {
      tarifa = horasCompletas * tarifaPorHora;
    } else {
      // Si no ha pasado ni una hora, se cobra la hora completa
      tarifa = tarifaPorHora;
    }

    // Si hay minutos restantes después de las horas completas
    if (minutosRestantes > 0 && horasCompletas > 0) {
      if (minutosRestantes <= 15) {
        // De 1 a 15 minutos: cobrar fracción adicional
        tarifa += fraccion;
      } else {
        // Más de 15 minutos: cobrar hora completa adicional
        tarifa += tarifaPorHora;
      }
    }

    return Math.round(tarifa);
  }

  private formatearDuracion(min: number): string {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h ? `${h}h ${m}m` : `${m}m`;
  }

  private generarId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private getStorageKey(): string {
    const uid = this.authService.getUID();
    return `parqueadero_datos_${uid}`;
  }

  private guardarDatos(): void {
    const data = {
      registros: this.registros,
      vehiculosDentro: Array.from(this.vehiculosDentro.entries()),
      config: this.config
    };
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  private cargarDatosGuardados(): void {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return;

    const parsed = JSON.parse(raw);

    this.registros = (parsed.registros || []).map((r: any) => ({
      ...r,
      fecha: new Date(r.fecha),
      horaEntrada: r.horaEntrada ? new Date(r.horaEntrada) : undefined,
      horaSalida: r.horaSalida ? new Date(r.horaSalida) : undefined
    }));

    this.vehiculosDentro = new Map(
      (parsed.vehiculosDentro || []).map(([k, v]: any) => [
        k,
        {
          ...v,
          fecha: new Date(v.fecha),
          horaEntrada: v.horaEntrada ? new Date(v.horaEntrada) : undefined,
          horaSalida: v.horaSalida ? new Date(v.horaSalida) : undefined
        }
      ])
    );

    this.config = parsed.config || this.config;
  }
}