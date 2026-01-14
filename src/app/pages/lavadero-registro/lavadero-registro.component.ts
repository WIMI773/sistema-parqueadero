// pages/lavadero-registro/lavadero-registro.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LavaderoService } from '../../services/lavadero.service';
import { ServicioLavado, RegistroLavado } from '../../models/lavadero.models';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-lavadero-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lavadero-registro.component.html',
  styleUrls: ['./lavadero-registro.component.css']
})
export class LavaderoRegistroComponent implements OnInit {

  placa = '';
  tipoVehiculo: 'auto' | 'moto' | 'camion' = 'auto';
  observaciones = '';
  
  serviciosDisponibles: ServicioLavado[] = [];
  serviciosSeleccionados: ServicioLavado[] = [];
  
  mensaje = '';
  tipoMensaje: 'success' | 'error' | '' = '';
  
  ticketEntrada: RegistroLavado | null = null;
  ticketSalida: RegistroLavado | null = null;
  
  serviciosEnEspera: RegistroLavado[] = [];
  serviciosEnProceso: RegistroLavado[] = [];
  serviciosCompletados: RegistroLavado[] = [];
  
  // Para escaneo de código de barras
  codigoBarrasInput = '';
  modoEscaneo = false;

  constructor(
    private lavaderoService: LavaderoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarServicios();
    this.cargarServiciosActivos();
  }

  private cargarServicios(): void {
    // Cargar servicios según el tipo de vehículo seleccionado
    this.serviciosDisponibles = this.lavaderoService.obtenerServiciosPorTipo(this.tipoVehiculo);
  }

  // Método que se ejecuta cuando cambia el tipo de vehículo
  onTipoVehiculoChange(): void {
    // Limpiar servicios seleccionados al cambiar tipo de vehículo
    this.serviciosSeleccionados = [];
    
    // Recargar servicios con precios del nuevo tipo de vehículo
    this.cargarServicios();
  }

  private cargarServiciosActivos(): void {
    this.serviciosEnEspera = this.lavaderoService.obtenerPorEstado('espera');
    this.serviciosEnProceso = this.lavaderoService.obtenerPorEstado('proceso');
    this.serviciosCompletados = this.lavaderoService.obtenerPorEstado('completado');
  }

  toggleServicio(servicio: ServicioLavado): void {
    const index = this.serviciosSeleccionados.findIndex(s => s.id === servicio.id);
    
    if (index > -1) {
      this.serviciosSeleccionados.splice(index, 1);
    } else {
      this.serviciosSeleccionados.push(servicio);
    }
  }

  estaSeleccionado(servicio: ServicioLavado): boolean {
    return this.serviciosSeleccionados.some(s => s.id === servicio.id);
  }

  calcularTotal(): number {
    return this.serviciosSeleccionados.reduce((total, s) => total + s.precio, 0);
  }

  registrar(): void {
    if (!this.placa.trim()) {
      this.mostrarError('Por favor ingrese la placa del vehículo');
      return;
    }

    if (this.serviciosSeleccionados.length === 0) {
      this.mostrarError('Por favor seleccione al menos un servicio');
      return;
    }

    const placaLimpia = this.placa.toUpperCase().trim();

    const registro = this.lavaderoService.registrarEntrada(
      placaLimpia,
      this.tipoVehiculo,
      this.serviciosSeleccionados,
      this.observaciones
    );

    if (registro) {
      this.ticketEntrada = registro;
      this.ticketSalida = null;
      this.generarCodigoBarras(registro.codigoBarras || registro.id, 'barcode-lavadero');
      
      this.mostrarExito(`✓ Servicio registrado para ${placaLimpia}`);
      this.limpiarFormulario();
      this.cargarServiciosActivos();
    } else {
      this.mostrarError('No se pudo registrar el servicio');
    }
  }

  private limpiarFormulario(): void {
    this.placa = '';
    this.observaciones = '';
    this.serviciosSeleccionados = [];
    this.tipoVehiculo = 'auto';
    this.cargarServicios();
  }

  cambiarEstado(registroId: string, nuevoEstado: 'proceso' | 'completado'): void {
    const exito = this.lavaderoService.cambiarEstado(registroId, nuevoEstado);
    
    if (exito) {
      const estadoTexto = nuevoEstado === 'proceso' ? 'En Proceso' : 'Completado';
      this.mostrarExito(`✓ Estado cambiado a: ${estadoTexto}`);
      this.cargarServiciosActivos();
    } else {
      this.mostrarError('No se pudo cambiar el estado');
    }
  }

  // ==================== TICKET DE SALIDA ====================

  procesarSalida(registro: RegistroLavado): void {
    const exito = this.lavaderoService.cambiarEstado(registro.id, 'entregado');
    
    if (exito) {
      this.lavaderoService.registrarPago(registro.id);
      this.ticketSalida = this.lavaderoService.obtenerRegistroPorId(registro.id);
      this.ticketEntrada = null;
      
      if (this.ticketSalida) {
        this.generarCodigoBarras(this.ticketSalida.codigoBarras || this.ticketSalida.id, 'barcode-salida');
      }
      
      this.mostrarExito(`✓ Servicio completado y entregado para ${registro.placa}`);
      this.cargarServiciosActivos();
    } else {
      this.mostrarError('No se pudo procesar la salida');
    }
  }

  // ==================== ESCANEO DE CÓDIGO DE BARRAS ====================

  toggleModoEscaneo(): void {
    this.modoEscaneo = !this.modoEscaneo;
    if (this.modoEscaneo) {
      this.codigoBarrasInput = '';
      setTimeout(() => {
        document.getElementById('codigo-barras-input')?.focus();
      }, 100);
    }
  }

  procesarCodigoBarras(): void {
    if (!this.codigoBarrasInput.trim()) {
      this.mostrarError('Ingrese un código de barras válido');
      return;
    }

    const registro = this.lavaderoService.registrarSalidaPorCodigo(this.codigoBarrasInput.trim());
    
    if (registro) {
      this.ticketSalida = registro;
      this.ticketEntrada = null;
      this.generarCodigoBarras(registro.codigoBarras || registro.id, 'barcode-salida');
      
      this.mostrarExito(`✓ Salida registrada para ${registro.placa}`);
      this.codigoBarrasInput = '';
      this.modoEscaneo = false;
      this.cargarServiciosActivos();
    } else {
      this.mostrarError('Código de barras no encontrado');
    }
  }

  // ==================== CÓDIGO DE BARRAS ====================

  generarCodigoBarras(valor: string, elementId: string): void {
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        JsBarcode(element, valor, {
          format: 'CODE128',
          width: 2,
          height: 60,
          displayValue: true
        });
      }
    }, 100);
  }

  // ==================== IMPRESIÓN ====================

  imprimirTicket(tipo: 'entrada' | 'salida'): void {
    const ticketId = tipo === 'entrada' ? 'ticket-lavadero-print' : 'ticket-salida-print';
    const ticket = document.getElementById(ticketId);
    if (!ticket) return;

    this.imprimirElemento(ticket);
  }

  private imprimirElemento(elemento: HTMLElement): void {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Ticket Lavadero</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }

            body {
              margin: 0;
              padding: 0;
              font-family: monospace;
              font-size: 12px;
            }

            .ticket {
              width: 80mm;
              padding: 5mm;
              text-align: center;
            }

            h4 {
              margin: 4px 0;
            }

            p {
              margin: 3px 0;
            }

            hr {
              border: 0;
              border-top: 1px dashed #000;
              margin: 6px 0;
            }

            svg {
              margin-top: 6px;
            }

            .msg {
              font-size: 10px;
              margin-top: 8px;
            }
          </style>
        </head>
        <body>
          ${elemento.innerHTML}
        </body>
      </html>
    `);

    doc.close();

    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();

    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }

  // ==================== EXPORTAR PDF ====================

  exportarPDF(): void {
    this.lavaderoService.generarPDFRegistros();
    this.mostrarExito('✓ PDF generado exitosamente');
  }

  // ==================== UTILIDADES ====================

  private mostrarExito(msg: string): void {
    this.mensaje = msg;
    this.tipoMensaje = 'success';
    setTimeout(() => (this.mensaje = ''), 4000);
  }

  private mostrarError(msg: string): void {
    this.mensaje = msg;
    this.tipoMensaje = 'error';
    setTimeout(() => (this.mensaje = ''), 4000);
  }

  volver(): void {
    this.router.navigate(['/home']);
  }

  obtenerIconoVehiculo(tipo: string): string {
    const iconos: any = {
      'auto': '🚗',
      'moto': '🏍️',
      'camion': '🚛'
    };
    return iconos[tipo] || '🚗';
  }

  calcularDuracionTotal(servicios: ServicioLavado[]): number {
    return servicios.reduce((sum, s) => sum + s.duracionEstimada, 0);
  }

  formatearDuracion(minutos: number): string {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    if (h > 0) {
      return `${h}h ${m}m`;
    }
    return `${m} min`;
  }

  calcularTiempoServicio(registro: RegistroLavado): string {
    if (!registro.horaSalida || !registro.horaEntrada) return 'N/A';
    
    const diff = +new Date(registro.horaSalida) - +new Date(registro.horaEntrada);
    const minutos = Math.floor(diff / 60000);
    return this.formatearDuracion(minutos);
  }
}