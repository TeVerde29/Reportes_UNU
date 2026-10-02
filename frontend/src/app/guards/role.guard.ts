// ============================================================
// GUARDIA DE ROL: ¿puedes entrar a esta zona?
// Guía: se usa junto a AuthGuard en app.routes.ts.
// Ejemplo: data: { roles: [3] } solo estudiantes,
//          data: { roles: [1, 2] } solo personal.
// Roles: 1 = Supervisor, 2 = Administrador, 3 = Estudiante.
// Si tu rol no está en la lista, te manda al login.
// ============================================================
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  // Lista de roles que sí pueden pasar (viene de la ruta)
  const rolesPermitidos = (route.data?.['roles'] as number[]) ?? [];

  return auth.me().pipe(
    map(resp => {
      const rol = resp?.data?.id_rol as number | undefined;
      // Si no hay sesión o el rol no está permitido, fuera
      if (!rol || !rolesPermitidos.includes(rol)) {
        router.navigateByUrl('/login');
        return false;
      }
      return true;
    }),
    catchError(() => {
      router.navigateByUrl('/login');
      return of(false);
    })
  );
};
