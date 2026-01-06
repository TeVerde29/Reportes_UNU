import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Reporte } from '../../../models/reporte.interface';
import { ReporteService } from '../../../services/reporte.service';
import { EstadoService } from '../../../services/estado.service';
import { TipoProblemaService } from '../../../services/tipo-problema.service';
import { TipoProbelma, TipoProbelmaResponse } from '../../../models/tipoProblema.interface';

@Component({
  selector: 'app-pendientes-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pendientes-form.component.html',
  styleUrl: './pendientes-form.component.css'
})
export class PendientesFormComponent implements OnInit {

  @Input() reporte!: Reporte;
  @Output() cerrar = new EventEmitter<void>();

  tiposProblema: TipoProbelma[] = [];
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
    this.form.id_tipo_problema = this.reporte.id_tipo_problema ?? 0;
    this.cargarTipoProblemas();
    this.cargarEstadoReporte();
  }

  cancelar(): void {
    this.cerrar.emit();
  }

  aceptar(): void {
    this.estadoService.obtenerEstadoPorNombre('Aceptado').subscribe(res => {
      const estado = Array.isArray(res.data) ? res.data[0] : res.data;
      if (!estado) return;
      this.reporteService.revisarReporte(this.reporte.id_reporte, {
        titulo: this.form.titulo,
        descripcion: this.form.descripcion,
        id_tipo_problema: this.form.id_tipo_problema,
        id_estado: estado.id_estado
      }).subscribe(() => this.cerrar.emit());
    });
  }

  rechazar(): void {
    this.estadoService.obtenerEstadoPorNombre('Rechazado').subscribe(res => {
      const estado = Array.isArray(res.data) ? res.data[0] : res.data;
      if (!estado) return;
      this.reporteService.revisarReporte(this.reporte.id_reporte, {
        titulo: this.form.titulo,
        descripcion: this.form.descripcion,
        id_tipo_problema: this.form.id_tipo_problema,
        id_estado: estado.id_estado
      }).subscribe(() => this.cerrar.emit());
    });
  }

  solucionar(): void {
    this.estadoService.obtenerEstadoPorNombre('Resuelto').subscribe(res => {
      const estado = Array.isArray(res.data) ? res.data[0] : res.data;
      if (!estado) return;
      this.reporteService.revisarReporte(this.reporte.id_reporte, {
        titulo: this.form.titulo,
        descripcion: this.form.descripcion,
        id_tipo_problema: this.form.id_tipo_problema,
        id_estado: estado.id_estado
      }).subscribe(() => this.cerrar.emit());
    });
  }


  cargarTipoProblemas(): void {
    this.tipoProblemaService.obtenerTiposProblema().subscribe({
      next: (res: TipoProbelmaResponse) => {
        this.tiposProblema = Array.isArray(res.data) ? res.data : [];
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
