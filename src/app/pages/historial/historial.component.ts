import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ParqueaderoService } from '../../services/parqueadero.service';
import { Registro } from '../../models/parqueadero.models';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css']
})
export class HistorialComponent implements OnInit {
  registros: Registro[] = [];
  filtro: 'todos' | 'entrada' | 'salida' | 'pagados' | 'pendientes' = 'todos';

  constructor(
    private parqueaderoService: ParqueaderoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  private cargarHistorial(): void {
    this.registros = this.parqueaderoService.obtenerHistorial(200);
  }

  get registrosFiltrados(): Registro[] {
    switch (this.filtro) {
      case 'entrada':
        return this.registros.filter((r) => r.tipo === 'entrada');
      case 'salida':
        return this.registros.filter((r) => r.tipo === 'salida');
      case 'pagados':
        return this.registros.filter((r) => r.pagado);
      case 'pendientes':
        return this.registros.filter((r) => !r.pagado && r.tipo === 'salida');
      default:
        return this.registros;
    }
  }

  get totalRecaudado(): number {
    return this.registros
      .filter((r) => r.pagado && r.tarifa)
      .reduce((sum, r) => sum + (r.tarifa || 0), 0);
  }

  get totalPendiente(): number {
    return this.registros
      .filter((r) => !r.pagado && r.tarifa && r.tipo === 'salida')
      .reduce((sum, r) => sum + (r.tarifa || 0), 0);
  }

  cambiarFiltro(nuevoFiltro: typeof this.filtro): void {
    this.filtro = nuevoFiltro;
  }

  descargarReporte(): void {
    try {
      const datos = this.registrosFiltrados.map((r) => [
        r.placa,
        r.tipo === 'entrada' ? '➕ Entrada' : '⏱ Salida',
        new Date(r.fecha).toLocaleString('es-CO'),
        r.duracion ? `${r.duracion} min` : '-',
        r.tarifa ? `$${r.tarifa.toLocaleString('es-CO')}` : '-',
        r.pagado ? '✅ Pagado' : '⏳ Pendiente'
      ]);

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const fecha = new Date().toLocaleString('es-CO');
      const titulo = `REPORTE DE PARQUEADERO - ${fecha}`;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Título
      pdf.setFontSize(16);
      pdf.text(titulo, pageWidth / 2, 15, {
        align: 'center'
      });

      // Información del reporte
      pdf.setFontSize(10);
      let yPos = 25;
      pdf.text(`Total Registros: ${this.registrosFiltrados.length}`, 15, yPos);
      yPos += 7;
      pdf.text(
        `Total Recaudado: $${this.totalRecaudado.toLocaleString('es-CO')}`,
        15,
        yPos
      );
      yPos += 7;
      pdf.text(
        `Total Pendiente: $${this.totalPendiente.toLocaleString('es-CO')}`,
        15,
        yPos
      );

      // Tabla simple dibujada manualmente
      yPos = 50;
      const colWidths = [25, 25, 40, 25, 30, 30];
      const headers = ['Placa', 'Tipo', 'Fecha/Hora', 'Duración', 'Tarifa', 'Estado'];
      const rowHeight = 8;
      const headerHeight = 10;

      // Encabezados
      pdf.setFillColor(102, 126, 234);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont('Arial', 'bold');

      let xPos = 15;
      for (let i = 0; i < headers.length; i++) {
        pdf.rect(xPos, yPos, colWidths[i], headerHeight, 'F');
        pdf.text(headers[i], xPos + 2, yPos + 6);
        xPos += colWidths[i];
      }

      yPos += headerHeight;

      // Datos de la tabla
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('Arial', 'normal');
      pdf.setFontSize(8);

      for (let i = 0; i < datos.length; i++) {
        // Cambiar color de fondo para filas alternas
        if (i % 2 === 0) {
          pdf.setFillColor(245, 245, 245);
          xPos = 15;
          for (let j = 0; j < colWidths.length; j++) {
            pdf.rect(xPos, yPos, colWidths[j], rowHeight, 'F');
            xPos += colWidths[j];
          }
        }

        // Escribir datos
        xPos = 15;
        for (let j = 0; j < datos[i].length; j++) {
          pdf.text(
            String(datos[i][j]).substring(0, 15),
            xPos + 2,
            yPos + 5
          );
          xPos += colWidths[j];
        }

        yPos += rowHeight;

        // Nueva página si es necesario
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = 20;
        }
      }

      // Pie de página
      const pageCount = (pdf as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text(
          `Página ${i} de ${pageCount}`,
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );
      }

      pdf.save(`reporte-parqueadero-${new Date().toISOString().split('T')[0]}.pdf`);
      console.log('✅ Reporte PDF descargado exitosamente');
    } catch (error) {
      console.error('Error al generar reporte PDF:', error);
      alert('Error al descargar el reporte: ' + error);
    }
  }

  volver(): void {
    this.router.navigate(['/home']);
  }

  abrirRecibo(registroId: string): void {
    this.router.navigate(['/recibo'], { queryParams: { id: registroId } });
  }}