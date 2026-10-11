import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Reporte } from '../../../models/reporte.interface';
import { environment } from '../../../environment/environment';
import { resolverFotoUrl } from '../../../utils/foto-url';
import { ReporteService } from '../../../services/reporte.service';
import { EstadoService } from '../../../services/estado.service';
import { TipoProblemaService } from '../../../services/tipo-problema.service';
import { TipoProbelma, TipoProbelmaResponse } from '../../../models/tipoProblema.interface';

@Component({
  selector: 'app-pendientes-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './pendientes-form.component.html',
  styleUrl: './pendientes-form.component.css'
})
export class PendientesFormComponent implements OnInit {

  @Input() reporte!: Reporte;
  @Output() cerrar = new EventEmitter<void>();

  tiposProblema: TipoProbelma[] = [];
  readonly baseUrl = environment.baseUrl;
  tipoEstado: string = '';
  form = {
    titulo: '',
    descripcion: '',
    id_tipo_problema: 0
  };

  constructor(
    private reporteService: ReporteService,
    private estadoService: EstadoService,
    private tipoProblemaService: TipoProblemaService
  ) {}

  ngOnInit(): void {
    this.form.titulo = this.reporte.titulo ?? '';
    this.form.descripcion = this.reporte.descripcion ?? '';
    this.form.id_tipo_problema = Number(this.reporte.id_tipo_problema ?? 0);
    this.cargarTipoProblemas();
    this.cargarEstadoReporte();
  }

  // mat-select compara con === : normaliza string/number para que
  // el valor actual siempre coincida con su opción y el combo abra bien.
  compararIds(a: unknown, b: unknown): boolean {
    return Number(a) === Number(b);
  }

  // Pendiente se decide, Aceptado se puede corregir, Resuelto solo se mira/elimina
  get esEditable(): boolean {
    return this.tipoEstado === 'Pendiente' || this.tipoEstado === 'Aceptado';
  }

  // Nube (URL absoluta) se usa tal cual, disco (ruta relativa) lleva baseUrl
  fotoSrc(url?: string | null): string | null {
    return resolverFotoUrl(url);
  }

  cancelar(): void {
    this.cerrar.emit();
  }

  // Categoría efectiva: la elegida en el combo o la actual como respaldo
  // (evita 400 del back si el combo quedara sin valor válido).
  private categoriaEfectiva(): number {
    const elegida = Number(this.form.id_tipo_problema);
    if (Number.isInteger(elegida) && elegida > 0) return elegida;
    return Number(this.reporte.id_tipo_problema ?? 0);
  }

  aceptar(): void {
    this.estadoService.obtenerEstadoPorNombre('Aceptado').subscribe(res => {
      const estado = Array.isArray(res.data) ? res.data[0] : res.data;
      if (!estado) return;
      this.reporteService.revisarReporte(this.reporte.id_reporte, {
        titulo: this.form.titulo,
        descripcion: this.form.descripcion,
        id_tipo_problema: this.categoriaEfectiva(),
        id_estado: estado.id_estado
      }).subscribe(() => this.cerrar.emit());
    });
  }

  rechazar(): void {
    // Rechazo = borrado total (registro + foto), sin estado Rechazado
    if (!this.reporte.id_reporte) return;
    this.reporteService.eliminarReporte(this.reporte.id_reporte)
      .subscribe(() => this.cerrar.emit());
  }

  actualizar(): void {
    this.estadoService.obtenerEstadoPorNombre('Aceptado').subscribe(res => {
      const estado = Array.isArray(res.data) ? res.data[0] : res.data;
      if (!estado) return;
      this.reporteService.revisarReporte(this.reporte.id_reporte, {
        titulo: this.form.titulo,
        descripcion: this.form.descripcion,
        id_tipo_problema: this.categoriaEfectiva(),
        id_estado: estado.id_estado
      }).subscribe(() => this.cerrar.emit());
    });
  }

  eliminar(): void {
    if (!this.reporte.id_reporte) return;
    if (!confirm('¿Eliminar este reporte? Se borra el registro y la foto.')) return;
    this.reporteService.eliminarReporte(this.reporte.id_reporte)
      .subscribe(() => this.cerrar.emit());
  }

  solucionar(): void {
    this.estadoService.obtenerEstadoPorNombre('Resuelto').subscribe(res => {
      const estado = Array.isArray(res.data) ? res.data[0] : res.data;
      if (!estado) return;
      this.reporteService.revisarReporte(this.reporte.id_reporte, {
        titulo: this.form.titulo,
        descripcion: this.form.descripcion,
        id_tipo_problema: this.categoriaEfectiva(),
        id_estado: estado.id_estado
      }).subscribe(() => this.cerrar.emit());
    });
  }


  cargarTipoProblemas(): void {
    this.tipoProblemaService.obtenerTiposProblema().subscribe({
      next: (res: TipoProbelmaResponse) => {
        this.tiposProblema = Array.isArray(res.data) ? res.data : [];
        // Si el catálogo no trae la categoría actual (o falló), se agrega
        // como opción para que el combo siempre tenga valor válido y usable.
        const actual = Number(this.form.id_tipo_problema);
        if (actual > 0 && !this.tiposProblema.some(t => Number(t.id_tipo_problema) === actual)) {
          this.tiposProblema = [
            ...this.tiposProblema,
            { id_tipo_problema: actual, nombre: this.reporte.tipo_problema ?? 'Categoría actual' }
          ];
        }
      },
      error: () => {
        const actual = Number(this.form.id_tipo_problema);
        this.tiposProblema = actual > 0
          ? [{ id_tipo_problema: actual, nombre: this.reporte.tipo_problema ?? 'Categoría actual' }]
          : [];
      }
    });
  }

  cargarEstadoReporte(): void {
    if (!this.reporte.id_estado) return;
    this.estadoService.obtenerEstadoPorId(this.reporte.id_estado)
      .subscribe({
        next: (res) => {
          const estado = Array.isArray(res.data) ? res.data[0] : res.data;
          this.tipoEstado = estado?.nombre ?? '';
        },
        error: () => {
          this.tipoEstado = '';
        }
      });
  }

}
