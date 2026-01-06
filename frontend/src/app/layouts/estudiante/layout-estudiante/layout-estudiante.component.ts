import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { EstudianteService } from '../../../services/estudiante.service';
import { Estudiante } from '../../../models/estudiante.interface';
import { Usuario } from '../../../models/usuario.interface';

@Component({
  selector: 'app-layout-estudiante',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './layout-estudiante.component.html',
  styleUrls: ['./layout-estudiante.component.css']
})
export class LayoutEstudianteComponent implements OnInit {
  estudiante: Estudiante | null = null;
  usuario: Usuario | null = null;
  activeTab: 'ultimos' | 'populares' | 'mis-reportes' = 'ultimos';

  constructor(
    private authService: AuthService,
    private estudianteService: EstudianteService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.cargarEstudiante();
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      this.activeTab = (tab === 'populares' || tab === 'mis-reportes') ? tab : 'ultimos';
    });
  }

  cargarEstudiante(): void {
    this.authService.me().subscribe({
      next: (response) => {
        this.usuario = response.data;
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
      },
      error: (err) => {
        console.error(err);
        this.router.navigateByUrl('/login');
      },
    });
  }

  setActiveTab(tab: 'ultimos' | 'populares' | 'mis-reportes'): void {
    this.activeTab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge'
    });
  }

  obtenerIniciales(nombre: string): string {
    if (!nombre) return 'U';
    const partes = nombre.trim().split(' ');
    if (partes.length === 1) {
      return partes[0].charAt(0).toUpperCase();
    }
    return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => this.router.navigateByUrl('/login')
    });
  }
}