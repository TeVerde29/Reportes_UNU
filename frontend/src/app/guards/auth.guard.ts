// ============================================================
// GUARDIA DE SESIÓN: ¿estás logueado?
// Guía: antes de mostrar /estudiante o /trabajador, pregunta al
// back con GET /api/auth/me (lleva la cookie sid sola).
// Si el back dice data:null o falla, te manda a /login.
// No revisa roles aquí, eso lo hace RoleGuard.
// ============================================================
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

export const AuthGuard: CanActivateFn = () => {

  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.me().pipe(
    map(resp => {
      if (resp?.data?.id_rol) {
        return true;
      }
      router.navigateByUrl('/login');
      return false;
    }),
    catchError(() => {
      router.navigateByUrl('/login');
      return of(false);
    })
  );
};
