import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { Reporte } from '../../../models/reporte.interface';
import { ReporteService } from '../../../services/reporte.service';
import { EstadoService } from '../../../services/estado.service';
import { PendientesFormComponent } from '../pendientes-form/pendientes-form.component';

@Component({
  selector: 'app-solucionado-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    PendientesFormComponent
  ],
  templateUrl: './solucionado-list.component.html',
  styleUrl: './solucionado-list.component.css'
})
export class SolucionadoListComponent implements OnInit, OnDestroy {

  reportes: Reporte[] = [];
  error = '';
  reporteSeleccionado: Reporte | null = null;
  mostrarModal = false;

  // Lógica de búsqueda (se muestra todo, sin paginación)
  filtroTexto: string = '';

  private sub?: Subscription;

  constructor(
    private reporteService: ReporteService,
    private estadoService: EstadoService
  ) {}

  ngOnInit(): void {
    this.reportesSolucionar();
  }

  // Getters para filtrado (se muestra todo, sin paginación)
  get reportesFiltrados(): Reporte[] {
    if (!this.filtroTexto.trim()) return this.reportes;
    const busqueda = this.filtroTexto.toLowerCase();
    return this.reportes.filter(r =>
      r.titulo?.toLowerCase().includes(busqueda) ||
      r.estudiante?.toLowerCase().includes(busqueda) ||
      r.ubicacion?.toLowerCase().includes(busqueda)
    );
  }

  reportesSolucionar(): void {
    this.sub = this.estadoService.obtenerEstadoPorNombre('Resuelto').subscribe({
      next: (response) => {
        const estadoResuelto = Array.isArray(response.data)
          ? response.data[0]
          : response.data;

        if (!estadoResuelto) {
          this.error = 'No se encontró el estado Resuelto';
          return;
        }

        this.reporteService
          .obtenerReportesPorIdEstado(estadoResuelto.id_estado, { limit: 500 })
          .subscribe({
            next: (resp) => {
              if (resp.success && Array.isArray(resp.data)) {
                this.reportes = resp.data;
              } else {
                this.error = 'No se pudieron cargar los reportes resueltos';
              }
            },
            error: () => this.error = 'Error al cargar los reportes'
          });
      },
      error: () => this.error = 'Error al obtener estado'
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
    this.reportesSolucionar();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
