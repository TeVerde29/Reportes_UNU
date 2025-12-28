import { Routes } from '@angular/router';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { InicioListComponent } from './components/inicio-list/inicio-list.component';
import { ReporteFormComponent } from './components/reporte-form/reporte-form.component';
import { PendientesListComponent } from './components/pendientes-list/pendientes-list.component';
import { PendientesFormComponent } from './components/pendientes-form/pendientes-form.component';

export const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" },
  { path: 'login', component: LoginFormComponent },
  { path: 'inicio', component: InicioListComponent},
  { path: 'nuevo-reporte', component: ReporteFormComponent},
  { path: 'reportes-pendientes', component: PendientesListComponent},
  { path: 'ver-reporte/:id', component: PendientesFormComponent }
  //{ path: 'mis-reportes', component: }
];
