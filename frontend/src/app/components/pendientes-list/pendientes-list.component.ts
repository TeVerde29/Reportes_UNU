import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EstadoService } from '../../services/estado.service';
import { ReporteService } from '../../services/reporte.service';
import { Estudiante } from '../../models/estudiante.interface';
import { Reporte } from '../../models/reporte.interface';
import { Subscription } from 'rxjs';
import { UsuarioService } from '../../services/usuario.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PendientesFormComponent } from '../pendientes-form/pendientes-form.component';

@Component({
  selector: 'app-pendientes-list',
  standalone: true,
  imports: [
  CommonModule,
  FormsModule,
  RouterLink,
  PendientesFormComponent   // 👈 CLAVE
],

  templateUrl: './pendientes-list.component.html',
  styleUrl: './pendientes-list.component.css',
})
export class PendientesListComponent implements OnInit {
  reportes: Reporte[] = [];
  error: string = '';
  estudiante: Estudiante | null = null;
  reporteSeleccionado: Reporte | null = null;
  mostrarModal = false;

  private estudianteSubscription?: Subscription;
  constructor(
    private reporteService: ReporteService,
    private estadoServide: EstadoService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.usuarioService.isAuthenticated()) {
      this.router.navigateByUrl('/login');
      return;
    }
    if (!this.usuarioService.isAdmin()) {
      this.usuarioService.logout();
      this.router.navigateByUrl('/login');
      return;
    }
    this.reportesPendientes();

  }

  reportesPendientes(): void {
    this.estadoServide.obtenerEstadoPorNombre('Pendiente').subscribe({
      next: (response) => {
        const estadoAceptado = Array.isArray(response.data)
          ? response.data[0]
          : response.data;
        if (!estadoAceptado) {
          this.error = 'No se encontró el estado Aceptado';
          return;
        }
        this.reporteService
          .obtenerReportesPorIdEstado(estadoAceptado.id_estado)
          .subscribe({
            next: (resp) => {
              if (resp.success && Array.isArray(resp.data)) {
                this.reportes = resp.data;
              } else {
                this.error = 'No se pudieron cargar los reportes';
              }
            },
            error: (er) => {
              console.error('Error al obtener los reportes:', er);
              this.error = 'Error al cargar los reportes';
            },
          });
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error al obtener estado';
        console.error('Error al obtener estado:', err);
      },
    });
  }

  abrirModal(reporte: Reporte): void {
    this.reporteSeleccionado = reporte;
    this.mostrarModal = true;
    document.body.style.overflow = 'hidden'; // opcional
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.reporteSeleccionado = null;
    document.body.style.overflow = '';
    this.reportesPendientes();
  }

  ngOnDestroy(): void {
    this.estudianteSubscription?.unsubscribe();
  }
}
