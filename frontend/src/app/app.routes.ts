import { Routes } from '@angular/router';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { InicioListComponent } from './components/inicio-list/inicio-list.component';
import { ReporteFormComponent } from './components/reporte-form/reporte-form.component';
import { PendientesListComponent } from './components/pendientes-list/pendientes-list.component';
import { PendientesFormComponent } from './components/pendientes-form/pendientes-form.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // 🔓 Ruta pública
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginFormComponent },

  // 🔐 Rutas protegidas
  {
    path: 'inicio',
    component: InicioListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'nuevo-reporte',
    component: ReporteFormComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'reportes-pendientes',
    component: PendientesListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'ver-reporte/:id',
    component: PendientesFormComponent,
    canActivate: [AuthGuard]
  },

  // 🔁 Cualquier otra ruta
  { path: '**', redirectTo: 'login' }
];
