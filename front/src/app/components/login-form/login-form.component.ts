import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { EstudianteService } from '../../services/estudiante.service';
import { Estudiante } from '../../models/estudiante.interface';
import { UsuarioResponse } from '../../models/usuario.interface';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginFormComponent implements OnInit {
  loginForm: FormGroup;
  estudianteId: number | null = null;
  error: string = '';
  successMessage: string = '';
  // estudiante: Estudiante;
  loading = false;
  
  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private estudianteService: EstudianteService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      codigo: ['', [Validators.required,]],
      clave: ['', [Validators.required,]],
    });
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    this.error = '';
    this.successMessage = '';
    
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    
    this.usuarioService.verificarUsuario(this.loginForm.value).subscribe({
      next: (resp: UsuarioResponse) => {
        this.loading = false;
        
        if (!resp.success || !resp.data) {
          this.error = resp.message || 'No se pudo iniciar sesión';
          return;
        }

        this.successMessage = resp.message;
        localStorage.setItem('usuario', JSON.stringify(resp.data));
        
        const route = resp.data.id_rol === 1 ? '/admin' : '/inicio';
        this.router.navigate([route]);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Error al conectar con el servidor';
      }
    });
  }

  get f() {
    return this.loginForm.controls;
  }

}
