# MEMORY.md — Contexto del sistema Reportes_UNU

> Memoria viva del proyecto: qué es, para qué sirve y qué reglas nunca se rompen.
> Actualizar cuando cambie una decisión de negocio o arquitectura.

## Qué es y para qué sirve

Sistema web de la UNU para reportar averías e incidencias del campus
(infraestructura, mobiliario, equipos, instalaciones, áreas verdes, seguridad, limpieza).
- El **estudiante** reporta con foto, apoya con likes y sigue sus reportes.
- El **personal** (supervisor/administrador) valida, atiende y mide con estadísticas.

## Reglas de negocio (no negociables)

1. **El alumno se autentica contra el API de la UNU (simulado en `estudiante`).**
   Esa tabla es solo-lectura conceptual: sin FK hacia ni desde ella.
2. **No existe `usuario` estudiante.** `usuario` es solo personal (roles 1 y 2).
   El rol 3 vive únicamente en la sesión.
3. **Los reportes se identifican por `codigo_estudiante`** (ej. `0002221081`),
   nunca por id interno: es la llave del API externo.
4. **No existe estado Rechazado.** Rechazar = borrado total (fila + reacciones +
   foto). Sin papelera, sin historial en BD.
5. **Pendiente > 7 días se elimina solo** (job diario 03:00, fila + foto).
6. **Los likes son 0/1 con UNIQUE(codigo, reporte)** y contador desnormalizado
   mantenido por transacción.
7. **El dueño sale de la sesión, nunca del body.** Ningún endpoint confía en
   ids de alumno enviados por el cliente.
8. **Toda subida exige foto real** (jpg/jpeg/png/webp, máx 5MB); el front la
   comprime antes de enviar.
9. **Las fotos viven en disco local** (`UPLOAD_DIR`); en BD solo la ruta.
   En nube (`CLOUDINARY_URL`) viven en Cloudinary; el código decide solo.
10. **Estados válidos: 1 Pendiente, 2 Aceptado, 3 Resuelto.** Nada más.

## Mapa de estados

```
Pendiente (1) ──aceptar──▶ Aceptado (2) ──resolver──▶ Resuelto (3)
     │                         │                         │
     └──── rechazar: DELETE ───┴──── eliminar: DELETE ────┘
              (+ foto)                  (+ foto)

Pendiente con fecha_reporte > 7 días ──job──▶ DELETE (+ foto)
```

## Sesión (forma de `req.session.auth`)

```ts
// Personal:  { id_usuario, id_rol: 1|2, id_estudiante: null, codigo_estudiante: null, id_trabajador }
// Alumno:    { id_usuario: null, id_rol: 3, id_estudiante, codigo_estudiante, id_trabajador: null }
```

## Decisiones de arquitectura (y por qué)

- **Sesiones en MySQL, no JWT:** revocación inmediata, simple para 7k usuarios.
- **`codigo_estudiante` en vez de FK:** el API externo manda; una FK borraría
  reportes si el alumno desaparece del API.
- **Sin paginación en UI (límite 500):** decisión explícita del dueño; si el
  volumen crece, reactivar `?page=` (el back lo soporta).
- **Paleta amazónica** (`--eu-*` en `styles.css`): selva `#256B45`, turquesa
  `#1F8A70`, terracota `#B5462B` (solo pendientes/eliminar), serif Fraunces
  solo en marca.
- **Front sin `localhost` hardcodeado:** todo sale de `environment`
  (`apiUrl`/`baseUrl` + `environment.prod.ts`).

## Límites conocidos

- Disco local efímero y MySQL requerido: bloquean despliegue free sin cambios
  (ver README § despliegue).
- `estudiante.clave` existe solo porque el API es simulado; en producción real
  esa columna no existe y el login delega al API.
- `sessions` se crea sola (`createDatabaseTable`); el dump la deja vacía.
