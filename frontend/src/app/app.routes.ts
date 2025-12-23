import { Routes } from '@angular/router';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { InicioListComponent } from './components/inicio-list/inicio-list.component';
import { AdminListComponent } from './components/admin-list/admin-list.component';
import { ReporteFormComponent } from './components/reporte-form/reporte-form.component';

export const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" },
  { path: 'login', component: LoginFormComponent },
  { path: 'inicio', component: InicioListComponent},
  { path: 'admin', component: AdminListComponent},
  { path: 'nuevo-reporte', component: ReporteFormComponent},
  //{ path: 'mis-reportes', component: }
];
