// ============================================================
// LOGIN (front)
// Guía: pide código+clave, si el back dice OK pregunta el rol
// con me() y te manda a tu zona: rol 3 → /estudiante,
// roles 1-2 → /trabajador.
// Anti-bots: con 3+ fallos el back exige CAPTCHA (Turnstile) y el
// widget aparece solo entonces (modo Managed: invisible si no hay
// sospecha). El token se manda en el login y se renueva en cada
// intento fallido (son de un solo uso).
// ============================================================
import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../environment/environment';

declare const turnstile: any;

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
  // CAPTCHA (solo visible cuando el back lo exige)
  mostrarCaptcha = false;
  private captchaToken: string | null = null;
  private captchaWidgetId: string | number | null = null;
  @ViewChild('captchaBox') captchaBox?: ElementRef;

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
    if (this.mostrarCaptcha && !this.captchaToken) {
      this.error = 'Completa la verificación para continuar';
      return;
    }
    this.loading = true;
    this.authService.login({ ...this.loginForm.value, captchaToken: this.captchaToken }).subscribe({
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
        // El back pide CAPTCHA con 3+ fallos: mostrar el widget
        if (err?.error?.requireCaptcha && !this.mostrarCaptcha) {
          this.mostrarCaptcha = true;
          setTimeout(() => this.renderCaptcha());
        }
        // El token es de un solo uso: renovarlo en cada fallo
        this.reiniciarCaptcha();
        this.error = err?.error?.message || 'Credenciales inválidas';
      }
    });
  }

  // Pinta el widget de Turnstile (solo cuando el back lo exige).
  // Reintenta porque api.js carga con async/defer y puede no existir aún.
  private renderCaptcha(intentos = 0): void {
    try {
      if (typeof turnstile === 'undefined') {
        if (intentos < 20) setTimeout(() => this.renderCaptcha(intentos + 1), 500);
        return;
      }
      if (!this.captchaBox || this.captchaWidgetId !== null) return;
      this.captchaWidgetId = turnstile.render(this.captchaBox.nativeElement, {
        sitekey: environment.turnstileSiteKey,
        callback: (token: string) => { this.captchaToken = token; },
        'expired-callback': () => { this.captchaToken = null; },
        'error-callback': () => { this.captchaToken = null; }
      });
    } catch {
      this.captchaToken = null;
    }
  }

  private reiniciarCaptcha(): void {
    this.captchaToken = null;
    // reset() limpia el token y deja el iframe listo para reintentar
    // (remove() en ciclos rápidos dejaba al widget huérfano)
    try {
      if (typeof turnstile !== 'undefined' && this.captchaWidgetId !== null) {
        turnstile.reset(this.captchaWidgetId);
      }
    } catch {
      this.captchaWidgetId = null;
    }
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
