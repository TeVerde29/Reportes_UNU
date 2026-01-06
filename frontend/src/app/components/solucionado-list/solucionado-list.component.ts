import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Reporte } from '../../models/reporte.interface';
import { ReporteService } from '../../services/reporte.service';
import { EstadoService } from '../../services/estado.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-solucionado-list',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './solucionado-list.component.html',
  styleUrl: './solucionado-list.component.css'
})
export class SolucionadoListComponent implements OnInit, OnDestroy{

  reportes: Reporte[] = [];
  error = '';

  private sub?: Subscription;
  constructor(
      private reporteService: ReporteService,
      private estadoService: EstadoService
  ) {}

  ngOnInit(): void {
    this.reportesSolucionar();
  }

  reportesSolucionar(): void {
    this.estadoService.obtenerEstadoPorNombre('Resuelto').subscribe({
      next: (response) => {
        const estadoResuelto = Array.isArray(response.data)
          ? response.data[0]
          : response.data;

        if (!estadoResuelto) {
          this.error = 'No se encontró el estado Resuelto';
          return;
        }

        this.reporteService
          .obtenerReportesPorIdEstado(estadoResuelto.id_estado)
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
