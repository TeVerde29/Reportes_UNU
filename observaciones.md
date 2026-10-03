# observaciones - Reportes_UNU

Acuerdos y observaciones (de más urgente a menos urgente).

## URGENTE

### 1. Codificar todo en base al script nuevo de BD
La BD ya cambió (sin `rol 3`, sin `estado 4`, sin `usuario.id_estudiante`, con `UNIQUE`, `utf8mb4`, `sessions`, `like 0/1`), falta alinear el código:
- Login: `backend/controllers/authController.js:99-128` ya no debe buscar/crear `usuario rol 3`. Solo trabajadores en `usuario`, alumnos por API simulada en `estudiante`.
- Rutas: `backend/routes/reporteRoute.js:32,34,37` ya no usa `requireRole([3])` ni `GET /mis-reportes/:id`. Usar sesión alumno y `GET /mis-reportes` sin id.
- Front: `inicio-list.component.ts:181` `cargarMisReportes()` sin mandar id; quitar referencias a `Rechazado` y a rol 3 en guards/menús.
- Validar `id_estado` solo `1,2,3` y `like` `0/1`; vaciar `sessions` en el dump (`TRUNCATE TABLE sessions;`); usar largos nuevos `titulo 150, descripcion 1000, foto 255`.

### 2. Pendientes por más de una semana se eliminan automáticamente
Todo `Pendiente (1)` con `fecha_reporte < NOW() - 7 días` se borra solo (registro + imagen).
- Job diario (cron / `node-cron` en `server.js`): `DELETE FROM reporte WHERE id_estado=1 AND fecha_reporte < DATE_SUB(NOW(), INTERVAL 7 DAY)`.

## IMPORTANTE

### 3. Filtros y paginación en Inicio
`Últimos / Populares / Mis Reportes` no alcanza con 7k alumnos. Agregar filtro por `tipo_problema`, `ubicacion` y buscador por `titulo`, + paginación `?page=` con botón `Ver más` (hoy trae el 100% sin `LIMIT`).

### 4. Peso y validación de foto
- La foto es obligatoria en crear pero el form no lo exige de forma visible (`reporte-form.html:58`).
- Comprimir/redimensionar en front antes de subir y validar `jpg/png/webp` real + máx 5MB con mensaje JSON (hoy Multer devuelve HTML).
- Si la imagen no carga (`localhost:3000/uploads/...` caído), mostrar placeholder en vez de roto (`inicio-list.html:53` hardcodea URL).
