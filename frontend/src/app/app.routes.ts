import { Routes } from '@angular/router';

// COMPONENTES
import { LoginFormComponent } from './components/login-form/login-form.component';
import { InicioListComponent } from './components/inicio-list/inicio-list.component';
import { ReporteFormComponent } from './components/reporte-form/reporte-form.component';
import { PendientesListComponent } from './components/pendientes-list/pendientes-list.component';
import { PendientesFormComponent } from './components/pendientes-form/pendientes-form.component';

// LAYOUTS


// GUARD
import { AuthGuard } from './guards/auth.guard';
import { LayoutEstudianteComponent } from './layouts/estudiante/layout-estudiante/layout-estudiante.component';
import { LayoutTrabajadorComponent } from './layouts/trabajador/layout-trabajador/layout-trabajador.component';

export const routes: Routes = [

  // 🔓 LOGIN (PÚBLICO)
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginFormComponent },

  // ============================
  // 🧑‍🎓 ESTUDIANTE
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
  // 👷 TRABAJADOR
  // ============================
  {
    path: 'trabajador',
    component: LayoutTrabajadorComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'reportes-pendientes', component: PendientesListComponent },
      { path: 'ver-reporte/:id', component: PendientesFormComponent },
      
      { path: '', redirectTo: 'reportes-pendientes', pathMatch: 'full' }
    ]
  },

  // ❌ CUALQUIER OTRA RUTA
  { path: '**', redirectTo: 'login' }
];
