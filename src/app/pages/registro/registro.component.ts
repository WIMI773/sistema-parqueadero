import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ParqueaderoService } from '../../services/parqueadero.service';
import { Registro } from '../../models/parqueadero.models';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit {

  placa = '';
  codigoBarras = '';
  tipo: 'auto' | 'moto' | 'camion' = 'auto';
  operacion: 'entrada' | 'salida' = 'entrada';
  mensaje = '';
  tipoMensaje: 'success' | 'error' | '' = '';
  ultimoRegistro: Registro | null = null;

  ticketEntrada: Registro | null = null;
  ticketSalida: any | null = null;
  mostrarRecibo = false;

  vehiculosDentro: Array<{
    placa: string;
    horaEntrada: Date;
    duracion: string;
  }> = [];

  constructor(
    private parqueaderoService: ParqueaderoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarVehiculosDentro();
  }

  registrar(): void {
    this.operacion === 'entrada'
      ? this.registrarEntrada()
      : this.registrarSalida();
  }

  private registrarEntrada(): void {
    if (!this.placa.trim()) {
      this.mostrarError('Por favor ingrese la placa');
      return;
    }

    const placaLimpia = this.placa.toUpperCase().trim();
    const registro = this.parqueaderoService.registrarEntrada(
      placaLimpia,
      this.tipo
    );

    if (registro) {
      this.ticketEntrada = registro;

      setTimeout(() => {
        this.generarCodigoBarras(registro.codigoBarras || registro.id);
      }, 150);

      this.mostrarExito(`✓ Entrada registrada para ${placaLimpia}`);
      this.placa = '';
      this.cargarVehiculosDentro();
    } else {
      this.mostrarError('No se pudo registrar la entrada');
    }
  }

  private registrarSalida(): void {
    if (this.codigoBarras.trim()) {
      this.registrarSalidaPorCodigo();
    } else if (this.placa.trim()) {
      this.registrarSalidaPorPlaca();
    } else {
      this.mostrarError('Ingrese placa o código de barras');
    }
  }

  private registrarSalidaPorCodigo(): void {
    const codigo = this.codigoBarras.trim();

    const entrada = this.parqueaderoService.obtenerHistorial().find(
      r => r.codigoBarras === codigo && r.tipo === 'entrada'
    );

    if (!entrada) {
      this.mostrarError('Código inválido');
      return;
    }

    const registro = this.parqueaderoService.registrarSalida(entrada.placa);

    if (registro) {
      this.ultimoRegistro = registro;
      this.generarRecibo(registro);
      this.codigoBarras = '';
      this.placa = '';
      this.cargarVehiculosDentro();
    } else {
      this.mostrarError('El vehículo no está dentro');
    }
  }

  private registrarSalidaPorPlaca(): void {
    const placaLimpia = this.placa.toUpperCase().trim();
    const registro = this.parqueaderoService.registrarSalida(placaLimpia);

    if (registro) {
      this.ultimoRegistro = registro;
      this.generarRecibo(registro);
      this.placa = '';
      this.cargarVehiculosDentro();
    } else {
      this.mostrarError('No se encontró entrada activa');
    }
  }

  private generarRecibo(registro: Registro): void {
    const recibo = this.parqueaderoService.obtenerRegistroParaRecibo(registro.id);
    if (!recibo) return;

    this.ticketSalida = recibo;
    this.mostrarRecibo = true;

    setTimeout(() => {
      if (registro.codigoBarras) {
        this.generarCodigoBarrasRecibo(registro.codigoBarras);
      }
    }, 150);
  }

  procesarPago(): void {
    if (!this.ticketSalida || !this.ultimoRegistro) return;

    const ok = this.parqueaderoService.registrarPago(this.ultimoRegistro.id);
    if (!ok) {
      this.mostrarError('Error al procesar pago');
      return;
    }

    this.ticketSalida = {
      ...this.ticketSalida,
      pagado: true,
      fechaPago: new Date()
    };

    setTimeout(() => {
      if (this.ultimoRegistro?.codigoBarras) {
        this.generarCodigoBarrasRecibo(this.ultimoRegistro.codigoBarras);
      }
    }, 150);

    this.mostrarExito('✓ Pago registrado correctamente');
  }

  generarCodigoBarras(valor: string): void {
    const el = document.getElementById('barcode');
    if (!el) return;

    JsBarcode(el, valor, {
      format: 'CODE128',
      width: 2,
      height: 60,
      displayValue: true
    });
  }

  generarCodigoBarrasRecibo(valor: string): void {
    const el = document.getElementById('barcode-recibo');
    if (!el) return;

    JsBarcode(el, valor, {
      format: 'CODE128',
      width: 2,
      height: 60,
      displayValue: true
    });
  }

imprimirTicket(): void {
  if (!this.ticketEntrada) return;

  // Obtener el elemento del ticket
  const ticketElement = document.getElementById('ticket-print');
  if (!ticketElement) return;

  // Crear ventana de impresión
  const ventanaImpresion = window.open('', '_blank', 'width=350,height=600');
  if (!ventanaImpresion) return;

  const html = `
    <html>
      <head>
        <title>Ticket de Entrada</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { 
            margin: 0; 
            font-family: monospace; 
            font-size: 12px; 
          }
          .ticket { 
            width: 80mm; 
            padding: 5mm; 
            text-align: center; 
          }
          h4 { margin: 4px 0; }
          p { margin: 3px 0; }
          hr { border: 0; border-top: 1px dashed #000; margin: 6px 0; }
          svg { margin-top: 6px; }
          .msg { font-size: 10px; margin-top: 8px; line-height: 1.4; }
        </style>
      </head>
      <body>
        ${ticketElement.innerHTML}
      </body>
    </html>
  `;

  ventanaImpresion.document.open();
  ventanaImpresion.document.write(html);
  ventanaImpresion.document.close();

  // Esperar a que cargue y luego imprimir automáticamente
  ventanaImpresion.onload = () => {
    // Regenerar el código de barras en la ventana de impresión
    const barcodeElement = ventanaImpresion.document.getElementById('barcode');
    if (barcodeElement && this.ticketEntrada?.codigoBarras) {
      JsBarcode(barcodeElement, this.ticketEntrada.codigoBarras, {
        format: 'CODE128',
        width: 2,
        height: 60,
        displayValue: true
      });
    }

    // Imprimir automáticamente después de generar el código de barras
    setTimeout(() => {
      ventanaImpresion.focus();
      ventanaImpresion.print();
      ventanaImpresion.close();
    }, 200);
  };
}

private generarHTMLTicketEntrada(): string {
  if (!this.ticketEntrada) return '';

  return `
    <div class="ticket">
      <h4>═══════════════════</h4>
      <h4>PARQUEADERO</h4>
      <h4>TICKET DE ENTRADA</h4>
      <h4>═══════════════════</h4>

      <p><strong>Placa:</strong> ${this.ticketEntrada.placa}</p>
      <p><strong>Tipo:</strong> ${this.ticketEntrada.tipo}</p>
      <p><strong>Fecha:</strong> ${new Date(this.ticketEntrada.fecha).toLocaleDateString()}</p>
      <p><strong>Hora:</strong> ${new Date(this.ticketEntrada.fecha).toLocaleTimeString()}</p>

      <hr />

      <svg id="barcode-print"></svg>

      <hr />

      <p class="msg">
        CONSERVE ESTE TICKET<br />
        Preséntelo al salir<br />
        No nos responsabilizamos<br />
        por objetos dejados en<br />
        el vehículo
      </p>

      <h4>GRACIAS POR SU VISITA</h4>
    </div>
  `;
}


  imprimirRecibo(): void {
    const recibo = document.getElementById('recibo-print');
    if (recibo) this.imprimirElemento(recibo);
  }

  private imprimirElemento(elemento: HTMLElement): void {
    const html = `
      <html>
        <head>
          <title>Ticket Parqueadero</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { margin: 0; font-family: monospace; font-size: 12px; }
            .ticket { width: 80mm; padding: 5mm; text-align: center; }
            h4 { margin: 4px 0; }
            p { margin: 3px 0; }
            hr { border: 0; border-top: 1px dashed #000; margin: 6px 0; }
            svg { margin-top: 6px; }
            .msg { font-size: 10px; margin-top: 8px; }
          </style>
        </head>
        <body>
          ${elemento.innerHTML}
        </body>
      </html>
    `;

    const win = window.open('', '_blank', 'width=350,height=600');
    if (!win) return;

    win.document.open();
    win.document.write(html);
    win.document.close();

    win.onload = () => {
      win.focus();
      win.print();
      win.close();
    };
  }

  cerrarRecibo(): void {
    this.mostrarRecibo = false;
    this.ticketSalida = null;
    this.ultimoRegistro = null;
  }

  cambiarOperacion(op: 'entrada' | 'salida'): void {
    this.operacion = op;
    this.placa = '';
    this.codigoBarras = '';
    this.mensaje = '';
    this.ticketEntrada = null;
    this.ticketSalida = null;
    this.mostrarRecibo = false;
  }

  private cargarVehiculosDentro(): void {
    this.vehiculosDentro =
      this.parqueaderoService.obtenerVehiculosDentro();
  }

  private mostrarExito(msg: string): void {
    this.mensaje = msg;
    this.tipoMensaje = 'success';
    setTimeout(() => this.mensaje = '', 4000);
  }

  private mostrarError(msg: string): void {
    this.mensaje = msg;
    this.tipoMensaje = 'error';
    setTimeout(() => this.mensaje = '', 4000);
  }

  volver(): void {
    this.router.navigate(['/home']);
  }
}
