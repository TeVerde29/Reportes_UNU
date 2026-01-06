import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginFormComponent implements OnInit {

  loginForm: FormGroup;
  error: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      codigo: ['', Validators.required],
      clave: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (resp) => {
        if (resp?.data?.id_rol) {
          this.redirigirPorRol(resp.data.id_rol);
        }
      },
      error: () => {
        // No hay sesión → quedarse en login sin mostrar error
      }
    });
  }

  onSubmit(): void {
    this.error = '';
    if (this.loginForm.invalid || this.loading) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.authService.me().subscribe({
          next: (resp) => {
            this.loading = false;
            if (!resp?.data?.id_rol) {
              this.error = 'No se pudo determinar el rol';
              return;
            }
            this.redirigirPorRol(resp.data.id_rol);
          },
          error: () => {
            this.loading = false;
            this.error = 'No se pudo obtener la sesión';
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Credenciales inválidas';
      }
    });
  }

  private redirigirPorRol(rol: number): void {
    if (rol === 3) {
      this.router.navigateByUrl('/estudiante/inicio');
      return;
    }
    if (rol === 1 || rol === 2) {
      this.router.navigateByUrl('/trabajador/reportes-pendientes');
      return;
    }
    this.error = 'Rol no autorizado';
  }

  get f() {
    return this.loginForm.controls;
  }
}
