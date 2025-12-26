import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ReporteService } from '../../services/reporte.service';
import { Reporte } from '../../models/reporte.interface';
import { EstadoService } from '../../services/estado.service';
import { Estudiante } from '../../models/estudiante.interface';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-inicio-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './inicio-list.component.html',
  styleUrl: './inicio-list.component.css'
})
export class InicioListComponent implements OnInit, OnDestroy {

  reportes: Reporte[] = [];
  error: string = '';
  estudiante: Estudiante | null = null;

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
    if (this.usuarioService.isAdmin()) {
      this.usuarioService.logout();
      this.router.navigateByUrl('/login');
      return;
    }
    this.estudianteSubscription = this.usuarioService.estudiante$
      .pipe(filter((e): e is Estudiante => e !== null))
      .subscribe({
        next: (e) => {
          this.estudiante = e;
        },
        error: (err) => {
          console.error('Error en estudiante$:', err);
        }
      });
    this.cargarReportes();
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
            if (resp.success && Array.isArray(resp.data)) {
              this.reportes = resp.data;
            } else {
              this.error = 'No se pudieron cargar los reportes';
            }
          },
          error: (er) => {
            console.error('Error al obtener los reportes:', er);
            this.error = 'Error al cargar los reportes';
          }
        });
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error al obtener estado';
        console.error('Error al obtener estado:', err);
      }
    });
  }

  ngOnDestroy(): void {
    this.estudianteSubscription?.unsubscribe();
  }

  trackByIdReporte(index: number, item: Reporte): number {
    return item.id_reporte;
  }

  darLike(r: Reporte): void {
    r.cantidad_reacciones = (r.cantidad_reacciones || 0) + 1;
  }
}
