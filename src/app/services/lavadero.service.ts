// services/lavadero.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  ServicioLavado,
  RegistroLavado,
  EstadisticasLavadero,
  ConfiguracionLavadero
} from '../models/lavadero.models';
import { AuthService } from './auth.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class LavaderoService {

  private registros: RegistroLavado[] = [];
  
  private config: ConfiguracionLavadero = {
    serviciosDisponibles: [
      {
        id: 'basico',
        nombre: 'Lavado Básico',
        precio: 15000,
        duracionEstimada: 30,
        descripcion: 'Lavado exterior e interior básico',
        preciosPorTipo: {
          moto: 8000,
          auto: 15000,
          camion: 25000
        }
      },
      {
        id: 'completo',
        nombre: 'Lavado Completo',
        precio: 25000,
        duracionEstimada: 45,
        descripcion: 'Lavado exterior, interior y aspirado',
        preciosPorTipo: {
          moto: 12000,
          auto: 25000,
          camion: 40000
        }
      },
      {
        id: 'premium',
        nombre: 'Lavado Premium',
        precio: 40000,
        duracionEstimada: 60,
        descripcion: 'Lavado completo + encerado + limpieza profunda',
        preciosPorTipo: {
          moto: 20000,
          auto: 40000,
          camion: 60000
        }
      },
      {
        id: 'encerado',
        nombre: 'Encerado',
        precio: 20000,
        duracionEstimada: 30,
        descripcion: 'Encerado y pulido de carrocería',
        preciosPorTipo: {
          moto: 10000,
          auto: 20000,
          camion: 35000
        }
      },
      {
        id: 'motor',
        nombre: 'Lavado de Motor',
        precio: 15000,
        duracionEstimada: 20,
        descripcion: 'Limpieza de motor',
        preciosPorTipo: {
          moto: 8000,
          auto: 15000,
          camion: 25000
        }
      },
      {
        id: 'tapiceria',
        nombre: 'Limpieza Tapicería',
        precio: 30000,
        duracionEstimada: 60,
        descripcion: 'Lavado profundo de tapicería',
        preciosPorTipo: {
          moto: 15000,
          auto: 30000,
          camion: 50000
        }
      }
    ],
    horaApertura: '08:00',
    horaCierre: '18:00'
  };

  private estadisticasSubject!: BehaviorSubject<EstadisticasLavadero>;
  public estadisticas$!: Observable<EstadisticasLavadero>;

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
    tipoVehiculo: 'auto' | 'moto' | 'camion',
    servicios: ServicioLavado[],
    observaciones?: string
  ): RegistroLavado | null {

    if (servicios.length === 0) return null;

    const precioTotal = servicios.reduce((total, s) => total + s.precio, 0);
    const codigoBarras = `LV-${Date.now()}-${placa}`;

    const registro: RegistroLavado = {
      id: this.generarId(),
      placa: placa.toUpperCase().trim(),
      tipoVehiculo,
      servicios,
      precioTotal,
      estado: 'espera',
      horaEntrada: new Date(),
      observaciones,
      codigoBarras,
      pagado: false
    };

    this.registros.push(registro);
    this.persistirCambios();
    return registro;
  }

  // Cambiar estado del servicio
  cambiarEstado(
    registroId: string,
    nuevoEstado: 'espera' | 'proceso' | 'completado' | 'entregado'
  ): boolean {
    const registro = this.registros.find(r => r.id === registroId);
    if (!registro) return false;

    registro.estado = nuevoEstado;

    // Actualizar timestamps según el estado
    const ahora = new Date();
    if (nuevoEstado === 'proceso' && !registro.horaInicio) {
      registro.horaInicio = ahora;
    } else if (nuevoEstado === 'completado' && !registro.horaCompletado) {
      registro.horaCompletado = ahora;
    } else if (nuevoEstado === 'entregado' && !registro.horaSalida) {
      registro.horaSalida = ahora;
    }

    this.persistirCambios();
    return true;
  }

  // Registrar salida por código de barras
  registrarSalidaPorCodigo(codigoBarras: string): RegistroLavado | null {
    const registro = this.registros.find(r => r.codigoBarras === codigoBarras);
    if (!registro) return null;

    // Si está en espera o proceso, pasarlo a completado
    if (registro.estado === 'espera' || registro.estado === 'proceso') {
      registro.estado = 'completado';
      registro.horaCompletado = new Date();
    }

    // Marcar como entregado
    if (registro.estado === 'completado') {
      registro.estado = 'entregado';
      registro.horaSalida = new Date();
      registro.pagado = true;
    }

    this.persistirCambios();
    return registro;
  }

  // Registrar pago
  registrarPago(registroId: string): boolean {
    const registro = this.registros.find(r => r.id === registroId);
    if (!registro) return false;

    registro.pagado = true;
    this.persistirCambios();
    return true;
  }

  // Obtener servicios por estado
  obtenerPorEstado(estado: 'espera' | 'proceso' | 'completado' | 'entregado'): RegistroLavado[] {
    return this.registros.filter(r => r.estado === estado);
  }

  // Obtener todos los registros
  obtenerHistorial(limite = 100): RegistroLavado[] {
    return [...this.registros]
      .sort((a, b) => +new Date(b.horaEntrada) - +new Date(a.horaEntrada))
      .slice(0, limite);
  }

  // Obtener registro por ID
  obtenerRegistroPorId(id: string): RegistroLavado | null {
    return this.registros.find(r => r.id === id) || null;
  }

  // Obtener registro por código de barras
  obtenerRegistroPorCodigo(codigoBarras: string): RegistroLavado | null {
    return this.registros.find(r => r.codigoBarras === codigoBarras) || null;
  }

  // ==================== CONFIGURACIÓN ====================

  obtenerConfiguracion(): ConfiguracionLavadero {
    return JSON.parse(JSON.stringify(this.config));
  }

  actualizarConfiguracion(config: Partial<ConfiguracionLavadero>): void {
    this.config = { ...this.config, ...config };
    this.persistirCambios();
  }

  obtenerServiciosDisponibles(): ServicioLavado[] {
    return [...this.config.serviciosDisponibles];
  }

  // Obtener servicios con precios ajustados según tipo de vehículo
  obtenerServiciosPorTipo(tipoVehiculo: 'auto' | 'moto' | 'camion'): ServicioLavado[] {
    return this.config.serviciosDisponibles.map(servicio => ({
      ...servicio,
      precio: servicio.preciosPorTipo?.[tipoVehiculo] || servicio.precio
    }));
  }

  agregarServicio(servicio: ServicioLavado): void {
    this.config.serviciosDisponibles.push(servicio);
    this.persistirCambios();
  }

  actualizarServicio(servicioId: string, datos: Partial<ServicioLavado>): boolean {
    const index = this.config.serviciosDisponibles.findIndex(s => s.id === servicioId);
    if (index === -1) return false;

    this.config.serviciosDisponibles[index] = {
      ...this.config.serviciosDisponibles[index],
      ...datos
    };
    this.persistirCambios();
    return true;
  }

  eliminarServicio(servicioId: string): boolean {
    const index = this.config.serviciosDisponibles.findIndex(s => s.id === servicioId);
    if (index === -1) return false;

    this.config.serviciosDisponibles.splice(index, 1);
    this.persistirCambios();
    return true;
  }

  // ==================== ESTADÍSTICAS ====================

  private calcularEstadisticas(): EstadisticasLavadero {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const registrosHoy = this.registros.filter(
      r => new Date(r.horaEntrada) >= hoy
    );

    const serviciosEntregados = this.registros.filter(
      r => r.estado === 'entregado'
    );

    const recaudado = serviciosEntregados
      .filter(r => r.pagado)
      .reduce((sum, r) => sum + r.precioTotal, 0);

    return {
      serviciosEnEspera: this.registros.filter(r => r.estado === 'espera').length,
      serviciosEnProceso: this.registros.filter(r => r.estado === 'proceso').length,
      serviciosCompletados: this.registros.filter(r => r.estado === 'completado').length,
      serviciosEntregados: serviciosEntregados.length,
      totalRecaudado: recaudado,
      ingresoPromedio: serviciosEntregados.length > 0 
        ? recaudado / serviciosEntregados.length 
        : 0,
      serviciosHoy: registrosHoy.length
    };
  }

  // ==================== EXPORTAR PDF ====================

  generarPDFRegistros(fechaInicio?: Date, fechaFin?: Date): void {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('REGISTRO DE SERVICIOS - LAVADERO', 105, 20, { align: 'center' });
    
    // Fecha del reporte
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado el: ${new Date().toLocaleString('es-ES')}`, 105, 28, { align: 'center' });
    
    // Filtrar registros por fecha si se especifica
    let registrosFiltrados = [...this.registros];
    if (fechaInicio || fechaFin) {
      registrosFiltrados = registrosFiltrados.filter(r => {
        const fecha = new Date(r.horaEntrada);
        if (fechaInicio && fecha < fechaInicio) return false;
        if (fechaFin && fecha > fechaFin) return false;
        return true;
      });
    }

    // Preparar datos para la tabla
    const tableData = registrosFiltrados.map(r => [
      new Date(r.horaEntrada).toLocaleDateString('es-ES'),
      new Date(r.horaEntrada).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      r.placa,
      r.tipoVehiculo.toUpperCase(),
      r.servicios.map(s => s.nombre).join(', '),
      `$${r.precioTotal.toLocaleString()}`,
      this.traducirEstado(r.estado),
      r.pagado ? 'SÍ' : 'NO'
    ]);

    // Generar tabla
    autoTable(doc, {
      startY: 35,
      head: [['Fecha', 'Hora', 'Placa', 'Tipo', 'Servicios', 'Total', 'Estado', 'Pagado']],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [255, 204, 0], textColor: [0, 0, 0], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 35 }
    });

    // Resumen financiero
    const yFinal = (doc as any).lastAutoTable.finalY + 10;
    const totalRecaudado = registrosFiltrados
      .filter(r => r.pagado)
      .reduce((sum, r) => sum + r.precioTotal, 0);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total de servicios: ${registrosFiltrados.length}`, 14, yFinal);
    doc.text(`Total recaudado: $${totalRecaudado.toLocaleString()}`, 14, yFinal + 8);

    // Guardar PDF
    const nombreArchivo = `lavadero_registros_${new Date().getTime()}.pdf`;
    doc.save(nombreArchivo);
  }

  private traducirEstado(estado: string): string {
    const traducciones: any = {
      'espera': 'En Espera',
      'proceso': 'En Proceso',
      'completado': 'Completado',
      'entregado': 'Entregado'
    };
    return traducciones[estado] || estado;
  }

  resetearDatos(): void {
    this.registros = [];
    localStorage.removeItem(this.storageKey);
    this.actualizarEstadisticas();
  }

  // ==================== INTERNOS ====================

  private persistirCambios(): void {
    this.guardarDatos();
    this.actualizarEstadisticas();
  }

  private actualizarEstadisticas(): void {
    this.estadisticasSubject.next(this.calcularEstadisticas());
  }

  private generarId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private getStorageKey(): string {
    const uid = this.authService.getUID();
    return `lavadero_datos_${uid}`;
  }

  private guardarDatos(): void {
    const data = {
      registros: this.registros,
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
      horaEntrada: new Date(r.horaEntrada),
      horaInicio: r.horaInicio ? new Date(r.horaInicio) : undefined,
      horaCompletado: r.horaCompletado ? new Date(r.horaCompletado) : undefined,
      horaSalida: r.horaSalida ? new Date(r.horaSalida) : undefined
    }));

    if (parsed.config) {
      this.config = parsed.config;
    }
  }
}