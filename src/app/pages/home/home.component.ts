import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ParqueaderoService } from '../../services/parqueadero.service';
import { EstadisticasParqueadero, Registro } from '../../models/parqueadero.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  estadisticas: EstadisticasParqueadero | null = null;
  actividadReciente: Registro[] = [];
  private destroy$ = new Subject<void>();

  usuarioActual: string = '';
  uid: string | null = null;
  horaActual: string = '';

  constructor(
    private authService: AuthService,
    private parqueaderoService: ParqueaderoService,
    private router: Router
  ) {
    this.actualizarHora();
  }

  ngOnInit(): void {
    this.uid = this.authService.getUID();
    this.usuarioActual = this.authService.user?.email || 'Usuario';

    this.cargarEstadisticas();
    this.cargarActividad();

    setInterval(() => this.actualizarHora(), 1000);
    setInterval(() => this.cargarActividad(), 5000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarEstadisticas(): void {
    this.parqueaderoService.estadisticas$
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        this.estadisticas = stats;
      });
  }

  private cargarActividad(): void {
    this.actividadReciente = this.parqueaderoService.obtenerHistorial(5);
  }

  private actualizarHora(): void {
    this.horaActual = new Date().toLocaleTimeString('es-CO');
  }

  irRegistro(): void {
    this.router.navigate(['/registro']);
  }

  irLavadero(): void {
    this.router.navigate(['/lavadero-registro']);
  }

  irHistorial(): void {
    this.router.navigate(['/historial']);
  }

  irConfiguracion(): void {
    this.router.navigate(['/configuracion']);
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}