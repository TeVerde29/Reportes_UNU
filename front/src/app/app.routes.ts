import { Routes } from '@angular/router';
import { LoginFormComponent } from './components/login-form/login-form.component';

export const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" },
  { path: 'login', component: LoginFormComponent },
/*
  { path: "mapa", component: MapaComponent },
  { path: "reporte", component: ReporteListComponent },
  { path: "reporte/nuevo", component: ReporteFormComponent },
  { path: "reporte/editar/:id", component: ReporteFormComponent },
  { path: "reporte/:id", component: ReporteDetailComponent },
  { path: "reporte/estado/:id", component: ReporteListComponent }, 
  { path: "reporte/top/reacciones", component: ReporteListComponent }, 
  { path: "reporte/pendientes/estudiante/:id", component: ReporteListComponent }, 
  { path: "mantenimiento/kanban", component: KanbanComponent }
*/
];
