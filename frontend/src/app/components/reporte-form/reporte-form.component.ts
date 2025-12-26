import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Estudiante } from '../../models/estudiante.interface';
import { ReporteService } from '../../services/reporte.service';
import { Ubicacion, UbicacionResponse } from '../../models/ubicacion.interface';
import { UbicacionService } from '../../services/ubicacion.service';
import { TipoProbelma, TipoProbelmaResponse } from '../../models/tipo_problema.interface';
import { TipoProblemaService } from '../../services/tipo-problema.service';
import { UsuarioService } from '../../services/usuario.service';
import { filter, take } from 'rxjs/operators';
import { EstadoService } from '../../services/estado.service';
import { Estado, EstadoResponse } from '../../models/estado.interface';
import { ReporteCrear, ReporteCrearResponse } from '../../models/reporte.interface';

@Component({
  selector: 'app-reporte-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reporte-form.component.html',
  styleUrl: './reporte-form.component.css'
})
export class ReporteFormComponent implements OnInit {

  reporteForm: FormGroup;
  error: string = '';
  successMessage: string = '';
  estudiante: Estudiante | null = null;
  ubicaciones: Ubicacion[] = [];
  tipoProblemas: TipoProbelma[] = [];
  estado: Estado | null = null;
  enviando = false;

  // Variables para el manejo de la ubicación y foto
  ubicacionSeleccionadaNombre = '';
  previewUrl: string | null = null;
  fotoError: string = '';
  fotoFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private reporteService: ReporteService,
    private ubicacionService: UbicacionService,
    private tipoProblemaService: TipoProblemaService,
    private usuarioService: UsuarioService,
    private estadoService: EstadoService
  ) {
    this.reporteForm = this.fb.group({
      titulo: ['', [Validators.required]],
      descripcion: [null],
      id_tipo_problema: ['', [Validators.required]],
      id_ubicacion: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    if (!this.usuarioService.isAuthenticated()) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.cargarUbicaciones();
    this.cargarTipoProblemas();
    this.cargarEstadoPendiente('Pendiente');
    this.usuarioService.estudiante$
      .pipe(
        filter((e): e is Estudiante => e !== null),
        take(1)
      )
      .subscribe({
        next: (e) => this.estudiante = e,
        error: (err) => console.error('Error en estudiante$:', err)
      });
  }

  onSubmit(): void {
    if (this.enviando) return;
    this.error = '';
    this.successMessage = '';
    if (this.reporteForm.invalid) {
      this.reporteForm.markAllAsTouched();
      this.error = 'Por favor completa todos los campos requeridos.';
      return;
    }
    if (!this.estudiante?.id_estudiante) {
      this.error = 'No se encontró el estudiante para registrar el reporte.';
      return;
    }
    if (!this.estado?.id_estado) {
      this.error = 'No se pudo cargar el estado Pendiente.';
      return;
    }
    if (!this.fotoFile) {
      this.error = 'Debes seleccionar una imagen.';
      return;
    }
    // Crear FormData para enviar archivo al backend
    const formData = new FormData();
    formData.append('titulo', this.reporteForm.value.titulo);
    formData.append('descripcion', this.reporteForm.value.descripcion ?? '');
    formData.append('id_estudiante', String(this.estudiante.id_estudiante));
    formData.append('id_estado', String(this.estado.id_estado));
    formData.append('id_tipo_problema', String(this.reporteForm.value.id_tipo_problema));
    formData.append('id_ubicacion', String(this.reporteForm.value.id_ubicacion));
    formData.append('foto', this.fotoFile); // El archivo real

    this.enviando = true;

    this.reporteService.crearReporte(formData as any).subscribe({
      next: (response: ReporteCrearResponse) => {
        if (response.success) {
          this.successMessage = 'Reporte creado correctamente';
          setTimeout(() => {
            this.router.navigateByUrl('/inicio');
          }, 1500);
        } else {
          this.error = response.message || 'No se pudo crear el reporte';
        }
        this.enviando = false;
      },
      error: (err) => {
        console.error('Error al crear el reporte:', err);
        this.error = 'Error al crear el reporte';
        this.enviando = false;
      }
    });
  }

  cargarEstadoPendiente(nombre: string): void {
    this.estadoService.obtenerEstadoPorNombre(nombre).subscribe({
      next: (response: EstadoResponse) => {
        const data = response.data;
        if (!response.success || !data) {
          console.warn('No trae el estado:', nombre);
          this.estado = null;
          return;
        }
        const estado = Array.isArray(data) ? data[0] : data;
        this.estado = estado ?? null;
      },
      error: (err) => {
        console.error('Error al obtener el estado', nombre, err);
        this.estado = null;
      }
    });
  }

  cargarUbicaciones(): void {
    this.ubicacionService.obtenerUbicaciones().subscribe({
      next: (response: UbicacionResponse) => {
        const data = response.data;
        if (!response.success || !data) {
          console.warn('Respuesta no válida al obtener ubicaciones', response);
          this.ubicaciones = [];
          return;
        }
        this.ubicaciones = Array.isArray(data) ? data : [data];
      },
      error: (err) => {
        console.error('Error al obtener ubicaciones', err);
        this.ubicaciones = [];
      }
    });
  }

  cargarTipoProblemas(): void {
    this.tipoProblemaService.obtenerTiposProblema().subscribe({
      next: (response: TipoProbelmaResponse) => {
        console.log('Respuesta tipo problemas:', response); // DEBUG
        const data = response.data;
        if (!response.success || !data) {
          console.warn('Respuesta no válida al obtener los tipo de Problemas', response);
          this.tipoProblemas = [];
          return;
        }
        this.tipoProblemas = Array.isArray(data) ? data : [data];
        console.log('Tipo problemas cargados:', this.tipoProblemas); // DEBUG
      },
      error: (err) => {
        console.error('Error al obtener tipo de Problemas', err);
        this.tipoProblemas = [];
      }
    });
  }

  onFotoSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.fotoError = '';
    if (!file) {
      this.fotoFile = null;
      this.previewUrl = null;
      return;
    }
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      this.fotoError = 'Solo se permiten imágenes.';
      input.value = '';
      this.fotoFile = null;
      this.previewUrl = null;
      return;
    }
    // Validar tamaño máximo (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.fotoError = 'La imagen no debe superar los 5MB.';
      input.value = '';
      this.fotoFile = null;
      this.previewUrl = null;
      return;
    }
    // Guardar el archivo
    this.fotoFile = file;
    // Crear preview
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
  
}