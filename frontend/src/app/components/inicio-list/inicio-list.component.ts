import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteService } from '../../services/reporte.service';
import { Reporte } from '../../models/reporte.interface';
import { EstadoService } from '../../services/estado.service';
import { EstudianteService } from '../../services/estudiante.service';
import { Estudiante } from '../../models/estudiante.interface';

@Component({
  selector: 'app-inicio-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './inicio-list.component.html',
  styleUrl: './inicio-list.component.css'
})
export class InicioListComponent implements OnInit{
  reportes: Reporte[] = [];
  error: string = '';
  idUsuario: number = 0;
  estudiante: Estudiante | null = null;
  
  constructor(
    private reporteService: ReporteService,
    private estadoServide: EstadoService,
    private estudianteService: EstudianteService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.cargarReportes();
    const raw = localStorage.getItem('usuario');
    if (!raw) {
      this.router.navigateByUrl('/login');
      return;
    }
    try {
      const usuario = JSON.parse(raw);
      this.idUsuario = Number(usuario?.id_usuario || 0);
      if (!this.idUsuario) {
        this.router.navigateByUrl('/login');
        return;
      }
      this.cargarAlumno();
    } catch {
      localStorage.removeItem('usuario');
      this.router.navigateByUrl('/login');
    }
  }

  cargarAlumno(): void {
    this.estudianteService.obtenerEstudiantePorIdUsuario(this.idUsuario).subscribe({
      next: (response) => {
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          this.estudiante = response.data.length > 0 ? response.data[0] : null;
        } else {
          this.estudiante = response.data;
        }
        if (this.estudiante) {
          console.log('ID ESTUDIANTE:', this.estudiante.id_estudiante);
        }
      }
    },
      error: (err) => {
        console.log('Error al obtener el id Estudiante: ', err);
      }
    });
  }

  cargarReportes(): void {
    this.estadoServide.obtenerEstadoPorNombre('Aceptado').subscribe({
      next: (response) => {
        const estadoAceptado = Array.isArray(response.data) ? response.data[0] : response.data;
        if (!estadoAceptado) {
          this.error = 'No se encontró el estado Aceptado';
          return;
        }
        this.reporteService.obtenerReportesPorIdEstado(estadoAceptado.id_estado).subscribe({
          next: (resp) => {
            if(resp.success && Array.isArray(resp.data)){
              this.reportes = resp.data;
              console.log('Todos los reportes:', this.reportes);
            }
          },
          error: (er) => {
            console.error('Error al obtener los reportes:', er);
          }
        });
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error al obtener estado';
      }
    });
  }

  trackByIdReporte(index: number, item: Reporte): number {
    return item.id_reporte;
  }

  darLike(r: Reporte): void {
    r.cantidad_reacciones = (r.cantidad_reacciones || 0) + 1;
  }

}
