import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ParqueaderoService } from '../../services/parqueadero.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-recibo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recibo.component.html',
  styleUrls: ['./recibo.component.css']
})
export class ReciboComponent implements OnInit {
  recibo: any = null;
  cargando = true;
  registroId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private parqueaderoService: ParqueaderoService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.registroId = params['id'];
      if (this.registroId) {
        this.cargarRecibo();
      } else {
        this.cargando = false;
      }
    });
  }

  private cargarRecibo(): void {
    this.cargando = true;
    this.recibo =
      this.parqueaderoService.obtenerRegistroParaRecibo(this.registroId);
    this.cargando = false;
  }

  marcarPagado(): void {
    if (!this.recibo?.registroId) return;

    const exito = this.parqueaderoService.registrarPago(
      this.recibo.registroId
    );

    if (exito) {
      this.recibo.pagado = true;
    }
  }

  imprimirRecibo(): void {
    window.print();
  }

  volver(): void {
    this.router.navigate(['/historial']);
  }

  descargarPDF(): void {
    if (!this.recibo) return;

    const pdf = new jsPDF();
    let y = 20;

    pdf.setFontSize(18);
    pdf.text('RECIBO DE PARQUEADERO', 105, y, { align: 'center' });
    y += 15;

    pdf.setFontSize(12);
    pdf.text(`Placa: ${this.recibo.placa}`, 20, y); y += 8;
    pdf.text(`Entrada: ${new Date(this.recibo.horaEntrada).toLocaleString('es-CO')}`, 20, y); y += 8;
    pdf.text(`Salida: ${new Date(this.recibo.horaSalida).toLocaleString('es-CO')}`, 20, y); y += 8;
    pdf.text(`Duración: ${this.formatearDuracion(this.recibo.duracion)}`, 20, y); y += 8;
    pdf.text(`Total: $${this.recibo.tarifa.toLocaleString('es-CO')}`, 20, y); y += 12;

    pdf.text(
      this.recibo.pagado ? 'ESTADO: PAGADO' : 'ESTADO: PENDIENTE',
      20,
      y
    );

    pdf.save(`recibo-${this.recibo.placa}.pdf`);
  }

  formatearDuracion(minutos: number): string {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
}
