import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Reporte } from '../../../models/reporte.interface';
import { Subscription } from 'rxjs';
import { ReporteService } from '../../../services/reporte.service';
import { EstadoService } from '../../../services/estado.service';
import { PendientesFormComponent } from '../pendientes-form/pendientes-form.component';

@Component({
  selector: 'app-rechazados-list',
  imports: [
    CommonModule,
    FormsModule,
    PendientesFormComponent
  ],
  templateUrl: './rechazados-list.component.html',
  styleUrl: './rechazados-list.component.css'
})
export class RechazadosListComponent implements OnInit, OnDestroy {

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
      this.reportesRechazados();
    }

    reportesRechazados(): void {
      this.estadoService.obtenerEstadoPorNombre('Rechazado').subscribe({
        next: (response) => {
          const estadoRechazado = Array.isArray(response.data)
            ? response.data[0]
            : response.data;

          if (!estadoRechazado) {
            this.error = 'No se encontró el estado Rechazado';
            return;
          }

          this.reporteService
            .obtenerReportesPorIdEstado(estadoRechazado.id_estado)
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
      this.reportesRechazados();
    }

    ngOnDestroy(): void {
      this.sub?.unsubscribe();
    }
}
