import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Reporte } from '../../models/reporte.interface';
import { ReporteService } from '../../services/reporte.service';
import { EstadoService } from '../../services/estado.service';
import { TipoProblemaService } from '../../services/tipo-problema.service';
import { TipoProbelma, TipoProbelmaResponse } from '../../models/tipo_problema.interface';

@Component({
  selector: 'app-pendientes-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pendientes-form.component.html',
  styleUrl: './pendientes-form.component.css'
})
export class PendientesFormComponent implements OnInit {

  @Input() reporte!: Reporte;
  @Output() cerrar = new EventEmitter<void>();

  tiposProblema: TipoProbelma[] = [];

  form = {
    titulo: '',
    descripcion: '',
    id_tipo_problema: 0
  };

  constructor(
    private reporteService: ReporteService,
    private estadoService: EstadoService,
    private tipoProblemaService: TipoProblemaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form.titulo = this.reporte.titulo;
    this.form.descripcion = this.reporte.descripcion ?? '';
    this.form.id_tipo_problema = this.reporte.id_tipo_problema;

    this.cargarTipoProblemas();
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

  cargarTipoProblemas(): void {
    this.tipoProblemaService.obtenerTiposProblema().subscribe({
      next: (res: TipoProbelmaResponse) => {
        this.tiposProblema = Array.isArray(res.data) ? res.data : [];
      }
    });
  }
}
