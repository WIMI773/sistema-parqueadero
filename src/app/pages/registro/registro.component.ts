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

  const ticketElement = document.getElementById('ticket-print');
  if (!ticketElement) return;

  const ventanaImpresion = window.open('', '_blank', 'width=350,height=600');
  if (!ventanaImpresion) return;

  // Obtener la URL base de la aplicación
  const baseUrl = window.location.origin;

  const html = `
    <html>
      <head>
        <title>Ticket de Entrada</title>
        <style>
          @page { 
            size: 80mm auto; 
            margin: 0; 
          }
          body { 
            margin: 0; 
            padding: 0;
            font-family: 'Courier New', monospace; 
            background: white;
          }
          .ticket { 
            width: 80mm; 
            max-width: 80mm;
            padding: 3mm 5mm;
            text-align: center;
            box-sizing: border-box;
          }
          .ticket-logo {
            text-align: center;
            margin-bottom: 10px;
            padding: 8px 0;
            width: 100%;
          }
          .ticket-logo img {
            max-width: 60mm;
            width: 100%;
            max-height: 25mm;
            height: auto;
            display: block;
            margin: 0 auto;
            object-fit: contain;
          }
          h4 { 
            margin: 3px 0;
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            line-height: 1.3;
          }
          p { 
            margin: 3px 0;
            font-size: 11px;
            line-height: 1.4;
            text-align: left;
            padding-left: 3mm;
          }
          p strong {
            font-weight: bold;
            display: inline-block;
            min-width: 65px;
          }
          hr { 
            border: none; 
            border-top: 1px dashed #000; 
            margin: 6px 0;
            opacity: 0.8;
          }
          svg { 
            margin: 6px auto;
            max-width: 68mm;
            height: auto;
            display: block;
          }
          .msg { 
            font-size: 9px; 
            margin-top: 8px;
            line-height: 1.4;
            text-align: center;
            padding: 0 2mm;
          }
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

  ventanaImpresion.onload = () => {
    // Actualizar la ruta de la imagen
    const imgElement = ventanaImpresion.document.querySelector('.ticket-logo img') as HTMLImageElement;
    if (imgElement) {
      imgElement.src = `${baseUrl}/assets/images/111.png`;
    }

    // Regenerar el código de barras
    const barcodeElement = ventanaImpresion.document.getElementById('barcode');
    if (barcodeElement && this.ticketEntrada?.codigoBarras) {
      JsBarcode(barcodeElement, this.ticketEntrada.codigoBarras, {
        format: 'CODE128',
        width: 2,
        height: 60,
        displayValue: true
      });
    }

    // Imprimir después de que todo cargue
    setTimeout(() => {
      ventanaImpresion.focus();
      ventanaImpresion.print();
      ventanaImpresion.close();
    }, 500);
  };
}

imprimirRecibo(): void {
  if (!this.ticketSalida) return;

  const reciboElement = document.getElementById('recibo-print');
  if (!reciboElement) return;

  const ventanaImpresion = window.open('', '_blank', 'width=350,height=600');
  if (!ventanaImpresion) return;

  const baseUrl = window.location.origin;

  const html = `
    <html>
      <head>
        <title>Recibo de Pago</title>
        <style>
          @page { 
            size: 80mm auto; 
            margin: 0; 
          }
          body { 
            margin: 0; 
            padding: 0;
            font-family: 'Courier New', monospace; 
            background: white;
          }
          .ticket { 
            width: 80mm; 
            max-width: 80mm;
            padding: 3mm 5mm;
            text-align: center;
            box-sizing: border-box;
          }
          .ticket-logo {
            text-align: center;
            margin-bottom: 10px;
            padding: 8px 0;
            width: 100%;
          }
          .ticket-logo img {
            max-width: 60mm;
            width: 100%;
            max-height: 25mm;
            height: auto;
            display: block;
            margin: 0 auto;
            object-fit: contain;
          }
          h4 { 
            margin: 3px 0;
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            line-height: 1.3;
          }
          p { 
            margin: 3px 0;
            font-size: 11px;
            line-height: 1.4;
            text-align: left;
            padding-left: 3mm;
          }
          p strong {
            font-weight: bold;
            display: inline-block;
            min-width: 65px;
          }
          hr { 
            border: none; 
            border-top: 1px dashed #000; 
            margin: 6px 0;
            opacity: 0.8;
          }
          svg { 
            margin: 6px auto;
            max-width: 68mm;
            height: auto;
            display: block;
          }
          .msg { 
            font-size: 9px; 
            margin-top: 8px;
            line-height: 1.4;
            text-align: center;
            padding: 0 2mm;
          }
        </style>
      </head>
      <body>
        ${reciboElement.innerHTML}
      </body>
    </html>
  `;

  ventanaImpresion.document.open();
  ventanaImpresion.document.write(html);
  ventanaImpresion.document.close();

  ventanaImpresion.onload = () => {
    // Actualizar la ruta de la imagen
    const imgElement = ventanaImpresion.document.querySelector('.ticket-logo img') as HTMLImageElement;
    if (imgElement) {
      imgElement.src = `${baseUrl}/assets/images/111.png`;
    }

    // Regenerar el código de barras del recibo
    const barcodeElement = ventanaImpresion.document.getElementById('barcode-recibo');
    if (barcodeElement && this.ultimoRegistro?.codigoBarras) {
      JsBarcode(barcodeElement, this.ultimoRegistro.codigoBarras, {
        format: 'CODE128',
        width: 2,
        height: 60,
        displayValue: true
      });
    }

    // Imprimir después de que todo cargue
    setTimeout(() => {
      ventanaImpresion.focus();
      ventanaImpresion.print();
      ventanaImpresion.close();
    }, 500);
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
