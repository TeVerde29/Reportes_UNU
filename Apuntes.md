# Apuntes - Reportes_UNU

Acuerdos y observaciones (de más urgente a menos urgente).

## URGENTE

### 1. Reportes rechazados se eliminan por completo, sin registro
Cuando se rechaza en `revisarReporte`, no queda `id_estado = 4`:
- `DELETE FROM reaccion + reporte`,
- `fs.unlink` de la foto en `C:/Reportes_UNU_IMG/uploads/reportes/...`.
Sin motivo visible, sin tabla, sin log. Motivo: pruebas (`probando`, `Te verde`, `Jugando minecraft`, `Rosa Negra`, `Monotonía`) llenan disco/BD.

### 2. Pendientes por más de una semana se eliminan automáticamente
Todo `Pendiente (1)` con `fecha_reporte < NOW() - 7 días` se borra solo (registro + imagen).
- Job diario (cron / `node-cron` en `server.js`): `DELETE FROM reporte WHERE id_estado=1 AND fecha_reporte < DATE_SUB(NOW(), INTERVAL 7 DAY)`.

### 3. Rol Estudiante no debería existir en `usuario` (API externa)
Hoy `usuario` tiene `1 Supervisor, 2 Administrador, 3 Estudiante` y duplica `codigo+clave` de `estudiante` (`bd_reporte_incidencias.sql:163,273`). Si `estudiante` es API UNU, sobra:
- `usuario` = solo trabajadores (`id_trabajador`), `rol` = solo 1 y 2.
- Eliminar `rol 3` e `id_estudiante` de `usuario`. `estudiante` queda como caché sin `clave`; la API solo responde sí/no + datos (`nombres, escuela`).
- Login alumno: `back -> API {codigo,clave} -> sesión {codigo}` sin crear fila en `usuario` (`authController.js:99-128` actual crea usuario rol 3, no debería).
- `Mis Reportes`: cambiar `GET /mis-reportes/:id` (`reporteRoute.js:34`) por `GET /mis-reportes` sin id, filtrando por `req.session.alumno.codigo`. Igual `cargarMisReportes()` en `inicio-list.component.ts:181` ya no manda id.

## IMPORTANTE

### 4. Filtros y paginación en Inicio
`Últimos / Populares / Mis Reportes` no alcanza con 7k alumnos. Agregar filtro por `tipo_problema`, `ubicacion` y buscador por `titulo`, + paginación `?page=` con botón `Ver más` (hoy trae el 100% sin `LIMIT`).

### 5. Peso y validación de foto
- La foto es obligatoria en crear pero el form no lo exige de forma visible (`reporte-form.html:58`).
- Comprimir/redimensionar en front antes de subir y validar `jpg/png/webp` real + máx 5MB con mensaje JSON (hoy Multer devuelve HTML).
- Si la imagen no carga (`localhost:3000/uploads/...` caído), mostrar placeholder en vez de roto (`inicio-list.html:53` hardcodea URL).
