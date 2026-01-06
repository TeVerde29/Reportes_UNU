import { Routes } from '@angular/router';

// COMPONENTES
import { LoginFormComponent } from './components/auth/login-form/login-form.component';
import { InicioListComponent } from './components/estudiante/inicio-list/inicio-list.component';
import { ReporteFormComponent } from './components/estudiante/reporte-form/reporte-form.component';
import { PendientesListComponent } from './components/trabajador/pendientes-list/pendientes-list.component';
import { PendientesFormComponent } from './components/trabajador/pendientes-form/pendientes-form.component';

import { AuthGuard } from './guards/auth.guard';
import { LayoutEstudianteComponent } from './layouts/estudiante/layout-estudiante/layout-estudiante.component';
import { LayoutTrabajadorComponent } from './layouts/trabajador/layout-trabajador/layout-trabajador.component';
import { SolucionadoListComponent } from './components/trabajador/solucionado-list/solucionado-list.component';
import { AceptadosListComponent } from './components/trabajador/aceptados-list/aceptados-list.component';
import { RechazadosListComponent } from './components/trabajador/rechazados-list/rechazados-list.component';

export const routes: Routes = [

  // LOGIN (PÚBLICO)
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginFormComponent },

  // ============================
  // ESTUDIANTE
  // ============================
  {
    path: 'estudiante',
    component: LayoutEstudianteComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'inicio', component: InicioListComponent },
      { path: 'nuevo-reporte', component: ReporteFormComponent },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' }
    ]
  },

  // ============================
  //  TRABAJADOR
  // ============================
  {
    path: 'trabajador',
    component: LayoutTrabajadorComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'reportes-pendientes', component: PendientesListComponent },
      { path: 'reportes-solucionados', component: SolucionadoListComponent },
      { path: 'reportes-aceptados', component: AceptadosListComponent },
      { path: 'reportes-rechazados', component: RechazadosListComponent },
      { path: 'ver-reporte/:id', component: PendientesFormComponent },

      { path: '', redirectTo: 'reportes-pendientes', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
