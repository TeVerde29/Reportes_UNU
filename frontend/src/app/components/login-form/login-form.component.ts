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
  successMessage: string = '';
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
    // 🔁 Si ya hay sesión, redirigir
    this.authService.me().subscribe({
      next: (resp) => {
        const rol = resp.data.id_rol;
        if (rol === 1) {
          this.router.navigateByUrl('/reportes-pendientes');
        } else {
          this.router.navigateByUrl('/inicio');
        }
      },
      error: () => {
        // No hay sesión → quedarse en login
      }
    });
  }

  onSubmit(): void {
    this.error = '';
    this.successMessage = '';

    if (this.loginForm.invalid || this.loading) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    // 1️⃣ LOGIN → crea sesión
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {

        // 2️⃣ OBTENER SESIÓN
        this.authService.me().subscribe({
          next: (resp) => {
            this.loading = false;
            this.successMessage = 'Inicio de sesión exitoso';

            const rol = resp.data.id_rol;

            // 3️⃣ REDIRECCIÓN SEGÚN ROL
            if (rol === 1) {
              this.router.navigateByUrl('/reportes-pendientes');
            } else {
              this.router.navigateByUrl('/inicio');
            }
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

  get f() {
    return this.loginForm.controls;
  }
}
