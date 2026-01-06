import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Reporte } from '../../models/reporte.interface';
import { Subscription } from 'rxjs';
import { ReporteService } from '../../services/reporte.service';
import { EstadoService } from '../../services/estado.service';

@Component({
  selector: 'app-aceptados-list',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,],
  templateUrl: './aceptados-list.component.html',
  styleUrl: './aceptados-list.component.css'
})
export class AceptadosListComponent implements OnInit, OnDestroy {

  reportes: Reporte[] = [];
  error = '';

  private sub?: Subscription;

  constructor(
      private reporteService: ReporteService,
      private estadoService: EstadoService
  ) {}

  ngOnInit(): void {
    this.reportesAceptados();
  }

  reportesAceptados(): void {
    this.estadoService.obtenerEstadoPorNombre('Aceptado').subscribe({
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

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

}
