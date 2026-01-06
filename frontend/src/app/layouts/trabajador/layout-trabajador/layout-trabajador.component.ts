import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Trabajador } from '../../../models/trabajador.interface';
import { TrabajadorService } from '../../../services/trabajador.service';
import { Usuario } from '../../../models/usuario.interface';

@Component({
  selector: 'app-layout-trabajador',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout-trabajador.component.html',
  styleUrl: './layout-trabajador.component.css'
})
export class LayoutTrabajadorComponent {

  trabajador?: Trabajador;
  usuario: Usuario | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private trabajadorService:TrabajadorService
  ) {}

  ngOnInit(): void {
    this.cargarTrabajador();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => this.router.navigateByUrl('/login')
    });
  }

  cargarTrabajador(): void {
    this.authService.me().subscribe({
      next: (response) => {

        this.usuario = response.data;

        const idTrabajador = this.usuario?.id_trabajador ?? 0;

        if (idTrabajador !== 0) {
          this.trabajadorService.obtenerTrabajadorPorId(idTrabajador).subscribe({
            next: (resp) => {
              if (resp.success && resp.data) {
                this.trabajador = Array.isArray(resp.data) ? resp.data[0] : resp.data;
              }
            },
            error: (er) => {
              console.error('Error al obtener datos del trabajador:', er);
            }
          });
        }
      },
      error: (err) => {
        console.error('No se pudo validar la sesión:', err);
        this.router.navigateByUrl('/login');
      }
    });
  }
}
