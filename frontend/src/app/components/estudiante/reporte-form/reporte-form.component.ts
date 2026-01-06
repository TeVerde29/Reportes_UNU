import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Estudiante } from '../../../models/estudiante.interface';
import { ReporteService } from '../../../services/reporte.service';
import { Ubicacion, UbicacionResponse } from '../../../models/ubicacion.interface';
import { UbicacionService } from '../../../services/ubicacion.service';
import { TipoProbelma, TipoProbelmaResponse } from '../../../models/tipoProblema.interface';
import { TipoProblemaService } from '../../../services/tipo-problema.service';
import { EstadoService } from '../../../services/estado.service';
import { Estado, EstadoResponse } from '../../../models/estado.interface';
import { AuthService } from '../../../services/auth.service';
import { ReporteResponse } from '../../../models/reporte.interface';
import { Usuario } from '../../../models/usuario.interface';
import { EstudianteService } from '../../../services/estudiante.service';

@Component({
  selector: 'app-reporte-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reporte-form.component.html',
  styleUrl: './reporte-form.component.css'
})
export class ReporteFormComponent implements OnInit, AfterViewInit, OnDestroy {

  reporteForm: FormGroup;
  error: string = '';
  successMessage: string = '';
  estudiante: Estudiante | null = null;
  ubicaciones: Ubicacion[] = [];
  tipoProblemas: TipoProbelma[] = [];
  estado: Estado | null = null;
  enviando = false;
  usuario: Usuario | null = null;
  ubicacionSeleccionadaNombre = '';
  previewUrl: string | null = null;
  fotoError: string = '';
  fotoFile: File | null = null;

  @ViewChild('mapaSvg') mapaSvg?: ElementRef<SVGSVGElement>;
  @ViewChild('fotoInput') fotoInput?: ElementRef<HTMLInputElement>;

  private mapaInicializado = false;
  private cleanupFns: Array<() => void> = [];
  private ubicacionesPorNombre = new Map<string, Ubicacion>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private reporteService: ReporteService,
    private ubicacionService: UbicacionService,
    private tipoProblemaService: TipoProblemaService,
    private estadoService: EstadoService,
    private estudianteService: EstudianteService,
    private authService: AuthService
  ) {
    this.reporteForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: [''],
      id_tipo_problema: [null, [Validators.required]],
      id_ubicacion: [null, [Validators.required]],
    });
  }


  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (user) => {
        this.usuario = user.data;
        this.cargarEstudiante();
        this.cargarTipoProblemas();
        this.cargarUbicaciones();
        this.cargarEstadoPendiente('Pendiente');
      },
      error: () => {
        this.router.navigateByUrl('/login');
      }
    });
  }

  cargarEstudiante(): void {
    const idEstudiante = this.usuario?.id_estudiante ?? 0;
    this.estudianteService.obtenerEstudiantePorId(idEstudiante).subscribe({
      next: (resp) => {
        if (resp.success && resp.data) {
          this.estudiante = Array.isArray(resp.data) ? resp.data[0] : resp.data;
        }
      },
      error: (er) => {
        console.error('Error al obtener el estudiante:', er);
      },
    });
  }

  ngAfterViewInit(): void {
    this.intentarInicializarMapa();
  }

  ngOnDestroy(): void {
    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.fotoFile = null;
      this.previewUrl = null;
      this.fotoError = '';
      return;
    }
    const file = input.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.fotoError = 'Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)';
      this.fotoFile = null;
      this.previewUrl = null;
      input.value = '';
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.fotoError = 'La imagen no debe superar 5MB';
      this.fotoFile = null;
      this.previewUrl = null;
      input.value = '';
      return;
    }
    this.fotoError = '';
    this.fotoFile = file;
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
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
    const formData = new FormData();
    formData.append('titulo', this.reporteForm.value.titulo);
    formData.append('descripcion', this.reporteForm.value.descripcion || '');
    formData.append('id_estudiante', String(this.estudiante.id_estudiante));
    formData.append('id_estado', String(this.estado.id_estado));
    formData.append('id_tipo_problema', String(this.reporteForm.value.id_tipo_problema));
    formData.append('id_ubicacion', String(this.reporteForm.value.id_ubicacion));
    formData.append('foto', this.fotoFile, this.fotoFile.name);
    this.enviando = true;
    this.reporteService.crearReporte(formData).subscribe({
      next: (response: ReporteResponse) => {
        console.log('Respuesta del servidor:', response);
        if (response.success) {
          this.successMessage = 'Reporte creado correctamente';
          setTimeout(() => {
            this.router.navigateByUrl('/inicio');
          }, 500);
        } else {
          this.error = response.message || 'No se pudo crear el reporte';
        }
        this.enviando = false;
      },
      error: (err) => {
        console.error('Error al crear el reporte:', err);
        this.error = err.error?.message || 'Error al crear el reporte';
        this.enviando = false;
      }
    });
  }

  cargarEstadoPendiente(nombre: string): void {
    this.estadoService.obtenerEstadoPorNombre(nombre).subscribe({
      next: (response: EstadoResponse) => {
        const data = response.data;
        if (!response.success || !data) {
          console.warn('No se encontró el estado:', nombre);
          this.estado = null;
          return;
        }
        const estado = Array.isArray(data) ? data[0] : data;
        this.estado = estado ?? null;
        console.log('Estado Pendiente cargado:', this.estado);
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
        console.log('Ubicaciones cargadas:', this.ubicaciones);
        this.intentarInicializarMapa();
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
        const data = response.data;
        if (!response.success || !data) {
          console.warn('Respuesta no válida al obtener los tipo de Problemas', response);
          this.tipoProblemas = [];
          return;
        }
        this.tipoProblemas = Array.isArray(data) ? data : [data];
        console.log('Tipos de problema cargados:', this.tipoProblemas);
      },
      error: (err) => {
        console.error('Error al obtener tipo de Problemas', err);
        this.tipoProblemas = [];
      }
    });
  }

  private intentarInicializarMapa(): void {
    if (this.mapaInicializado) return;
    if (!this.mapaSvg?.nativeElement) return;
    if (!this.ubicaciones || this.ubicaciones.length === 0) return;
    console.log('Inicializando mapa con', this.ubicaciones.length, 'ubicaciones');
    this.ubicacionesPorNombre.clear();
    for (const u of this.ubicaciones) {
      const nombreNorm = this.normalize(u.nombre);
      this.ubicacionesPorNombre.set(nombreNorm, u);
      console.log(`Mapeando: "${u.nombre}" -> "${nombreNorm}" (ID: ${u.id_ubicacion})`);
    }
    const svg = this.mapaSvg.nativeElement;
    const edificios = Array.from(svg.querySelectorAll<SVGElement>('.edificio'));
    console.log('Edificios encontrados en SVG:', edificios.length);
    for (const el of edificios) {
      const nombreSvg = (el.getAttribute('data-name') ?? '').trim();
      if (!nombreSvg) continue;
      const nombreNorm = this.normalize(nombreSvg);
      const match = this.ubicacionesPorNombre.get(nombreNorm);
      if (match) {
        el.setAttribute('data-id', String(match.id_ubicacion));
        console.log(`✓ Vinculado: "${nombreSvg}" -> ID ${match.id_ubicacion}`);
      } else {
        console.warn(`✗ No se encontró ubicación para: "${nombreSvg}" (normalizado: "${nombreNorm}")`);
      }
    }
    const evtName = 'click';
    const handler = (el: SVGElement, e: Event) => {
      e.preventDefault();
      const idStr = el.getAttribute('data-id');
      const nombreSvg = (el.getAttribute('data-name') ?? '').trim();
      if (!idStr) {
        console.warn('Este elemento no tiene ID asignado:', nombreSvg);
        return;
      }
      const id = Number(idStr);
      if (!Number.isFinite(id)) return;
      edificios.forEach(x => x.classList.remove('active'));
      el.classList.add('active');
      this.reporteForm.get('id_ubicacion')?.setValue(id);
      this.reporteForm.get('id_ubicacion')?.markAsTouched();
      const match = this.ubicaciones.find(u => u.id_ubicacion === id);
      this.ubicacionSeleccionadaNombre = match?.nombre ?? nombreSvg;
      console.log('Ubicación seleccionada:', this.ubicacionSeleccionadaNombre, '(ID:', id, ')');
    };
    for (const el of edificios) {
      const fn = (e: Event) => handler(el, e);
      el.addEventListener(evtName, fn);
      this.cleanupFns.push(() => el.removeEventListener(evtName, fn));
    }
    this.mapaInicializado = true;
    console.log('Mapa inicializado correctamente');
  }

  private normalize(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quita tildes
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }
}
