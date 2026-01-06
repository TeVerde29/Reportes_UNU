import { Component, OnInit, OnDestroy } from '@angular/core';
import { EstadoService } from '../../../services/estado.service';
import { ReporteService } from '../../../services/reporte.service';
import { Reporte } from '../../../models/reporte.interface';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PendientesFormComponent } from '../pendientes-form/pendientes-form.component';

@Component({
  selector: 'app-pendientes-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PendientesFormComponent
  ],
  templateUrl: './pendientes-list.component.html',
  styleUrl: './pendientes-list.component.css',
})
export class PendientesListComponent implements OnInit, OnDestroy {

  reportes: Reporte[] = [];
  error = '';
  reporteSeleccionado: Reporte | null = null;
  mostrarModal = false;

  private sub?: Subscription;

  constructor(
    private reporteService: ReporteService,
    private estadoService: EstadoService
  ) {}

  ngOnInit(): void {
    this.reportesPendientes();
  }

  reportesPendientes(): void {
    this.estadoService.obtenerEstadoPorNombre('Pendiente').subscribe({
      next: (response) => {
        const estadoPendiente = Array.isArray(response.data)
          ? response.data[0]
          : response.data;

        if (!estadoPendiente) {
          this.error = 'No se encontró el estado Pendiente';
          return;
        }

        this.reporteService
          .obtenerReportesPorIdEstado(estadoPendiente.id_estado)
          .subscribe({
            next: (resp) => {
              if (resp.success && Array.isArray(resp.data)) {
                this.reportes = resp.data;
              } else {
                this.error = 'No se pudieron cargar los reportes';
              }
            },
            error: () => {
              this.error = 'Error al cargar los reportes';
            },
          });
      },
      error: () => {
        this.error = 'Error al obtener estado';
      },
    });
  }

  abrirModal(reporte: Reporte): void {
    this.reporteSeleccionado = reporte;
    this.mostrarModal = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.reporteSeleccionado = null;
    document.body.style.overflow = '';
    this.reportesPendientes();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
