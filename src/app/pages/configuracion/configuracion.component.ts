import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ParqueaderoService } from '../../services/parqueadero.service';
import { ConfiguracionParqueadero } from '../../models/parqueadero.models';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent implements OnInit {
  config: ConfiguracionParqueadero | null = null;
  mensaje: string = '';
  tipoMensaje: 'success' | 'error' | '' = '';
  guardando: boolean = false;

  constructor(
    private parqueaderoService: ParqueaderoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarConfiguracion();
  }

  private cargarConfiguracion(): void {
    this.config = this.parqueaderoService.obtenerConfiguracion();
  }

  guardarConfiguracion(): void {
    if (!this.config) return;

    this.guardando = true;

    // Validaciones
    if (this.config.cuposTotal < 1) {
      this.mostrarError('El total de cupos debe ser mayor a 0');
      this.guardando = false;
      return;
    }

    if (this.config.tarifaPorHora < 0 || this.config.tarifaMoto < 0 || this.config.tarifaCamion < 0) {
      this.mostrarError('Las tarifas no pueden ser negativas');
      this.guardando = false;
      return;
    }

    setTimeout(() => {
      this.parqueaderoService.actualizarConfiguracion(this.config!);
      this.mostrarExito('✓ Configuración guardada correctamente');
      this.guardando = false;
    }, 500);
  }

  reiniciarConfiguracion(): void {
    if (confirm('¿Desea reiniciar la configuración a valores por defecto?')) {
      const configDefault: ConfiguracionParqueadero = {
        cuposTotal: 50,
        tarifaPorHora: 2000,    // Tarifa carros (1 hora)
        tarifaMoto: 1000,        // Tarifa motos (1 hora)
        tarifaCamion: 3000,     // Tarifa camiones (1 hora)
        horaApertura: '06:00',
        horaCierre: '22:00'
      };
      this.parqueaderoService.actualizarConfiguracion(configDefault);
      this.config = configDefault;
      this.mostrarExito('✓ Configuración reiniciada correctamente');
    }
  }

  resetearDatos(): void {
    if (confirm('⚠️ Esto eliminará todos los registros del día.\n\n¿Desea continuar?')) {
      this.parqueaderoService.resetearDatos();
      this.mostrarExito('✓ Datos del día resetados correctamente');
    }
  }

  private mostrarExito(msg: string): void {
    this.mensaje = msg;
    this.tipoMensaje = 'success';
    setTimeout(() => {
      this.mensaje = '';
    }, 3000);
  }

  private mostrarError(msg: string): void {
    this.mensaje = msg;
    this.tipoMensaje = 'error';
    setTimeout(() => {
      this.mensaje = '';
    }, 3000);
  }

  volver(): void {
    this.router.navigate(['/home']);
  }
}