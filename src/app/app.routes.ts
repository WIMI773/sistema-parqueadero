import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { HistorialComponent } from './pages/historial/historial.component';
import { ConfiguracionComponent } from './pages/configuracion/configuracion.component';
import { ReciboComponent } from './pages/recibo/recibo.component';
import { authGuard } from './guards/auth.guard';
import { LavaderoEntregaComponent } from './pages/lavadero-entrega/lavadero-entrega.component';
import { LavaderoRegistroComponent } from './pages/lavadero-registro/lavadero-registro.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard]
  },

  
  {
    path: 'registro',
    component: RegistroComponent,
    canActivate: [authGuard]
  },

  { path: 'lavadero-registro',
    component: LavaderoRegistroComponent,
    canActivate: [authGuard]
  },

  {path: 'lavadero-entrega', 
    component: LavaderoEntregaComponent,
    canActivate: [authGuard]
  },

  {
    path: 'historial',
    component: HistorialComponent,
    canActivate: [authGuard]
  },
  {
    path: 'configuracion',
    component: ConfiguracionComponent,
    canActivate: [authGuard]
  },
  {
    path: 'recibo',
    component: ReciboComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'login' }
];
