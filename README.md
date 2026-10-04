# Reportes_UNU — Sistema de Reportes de Averías e Incidencias

Aplicación web para reportar incidencias dentro de la UNU (infraestructura, mobiliario,
equipos electrónicos, instalaciones eléctricas y sanitarias, áreas verdes, seguridad y limpieza).

Los estudiantes crean reportes con foto, les dan like a los reportes aceptados y hacen
seguimiento a los suyos. El personal (supervisor/administrador) revisa los pendientes,
los acepta, resuelve o los elimina (rechazo = borrado total), y consulta estadísticas
por tipo de problema, ubicación, mes y estado.

## Stack

| Capa      | Tecnología                                                                |
|-----------|---------------------------------------------------------------------------|
| Backend   | Node.js v22 + Express 5 + `mysql2` + `multer`                             |
| Auth      | `express-session` + `express-mysql-session` (cookie `sid`, 8h) + `bcrypt` |
| Seguridad | `helmet`, `cors`, `express-rate-limit` (login)                            |
| Frontend  | Angular 19 standalone + Angular Material + Chart.js (`ng2-charts`)        |
| BD        | MySQL 8 (`utf8mb4`) — script en `database/bd_reporte_incidencias.sql`     |

## Arquitectura

```
┌──────────┐  cookie sid  ┌──────────┐  SQL   ┌────────┐
│ Angular  │ ◄──────────► │ Express  │ ◄────► │ MySQL  │
│  :4200   │  JSON + CORS │  :3000   │        │        │
└──────────┘              └────┬─────┘        └────────┘
                               │ sugestão
                        disco local (fotos)
```

- **Sesiones, no tokens.** `POST /api/auth/login` crea `req.session.auth`;
  `requireSession` + `requireRole([1,2])` / `requireEstudiante` protegen rutas.
- **Alumnos vía API simulada.** La tabla `estudiante` simula el API externo de la UNU:
  sin FK hacia ni desde ella; `reporte`/`reaccion` guardan `codigo_estudiante`
  (referencia lógica). El rol 3 (estudiante) solo vive en sesión, no hay fila
  `usuario` para alumnos. `usuario` es solo personal interno.
- **Estados:** `1 Pendiente`, `2 Aceptado`, `3 Resuelto` (sin Rechazado: rechazar borra
  fila + reacciones en cascada + foto con `fs.unlink`).
- **Likes:** `like` 0/1 con `UNIQUE(codigo_estudiante, id_reporte)` + transacción que
  mantiene `cantidad_reacciones`.
- **Job diario (03:00):** `backend/jobs/limpiarPendientes.js` borra pendientes con
  más de 7 días (fila + foto), programado con `setInterval` en `server.js`.
- **Fotos:** `multer` (5MB, jpg/jpeg/png/webp, nombre aleatorio 32 chars) en
  `UPLOAD_DIR`; errores devueltos como JSON.

## Puesta en marcha

### 1. Base de datos

```sql
SOURCE database/bd_reporte_incidencias.sql;  -- crea reporte_incidencias + sessions (vacía)
```

### 2. Backend

```bash
cd backend
npm install
```

Crea `backend/.env` (local, no se commitea):

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=reporte_incidencias
BCRYPT_ROUNDS=10
SESSION_SECRET=una_clave_larga_y_secreta
FRONTEND_ORIGIN=http://localhost:4200
COOKIE_SECURE=false
UPLOAD_DIR=C:/Reportes_UNU/Reportes_UNU_IMG/uploads/reportes
```

```bash
node server.js   # http://localhost:3000
```

### 3. Frontend

```bash
cd frontend
npm install
npm start        # http://localhost:4200 (ng serve)
npm run build    # prod: usa environment.prod.ts (fileReplacements)
```

## Estructura

```
Reportes_UNU/
├── backend/        # API Express: controllers/, routes/, middleware/,
│                   # jobs/limpiarPendientes.js, config/, server.js
├── frontend/       # App Angular: components/{auth,estudiante,trabajador,
│                   # estadistica}, layouts/, guards/, services/, models/
├── database/       # bd_reporte_incidencias.sql (script canónico limpio)
├── documentation/  # Informes del proyecto
├── Reportes_UNU_IMG/uploads/reportes/  # Fotos (no se commitea el contenido)
├── observaciones.md
└── README.md
```

## Funcionalidades

- **Estudiante:** feed Últimos/Populares/Mis reportes (grid 2 col, filtros por
  categoría/ubicación/búsqueda, `?page=&limit=`, visor de foto, likes), crear/editar
  con foto comprimida en front, fechas estilo red social, bottom-nav en móvil.
- **Trabajador:** tablas Pendientes/Aceptados/Solucionados (búsqueda, sin Carrera),
  modal de revisión (aceptar/resolver/actualizar/eliminar), dashboard con KPIs,
  tendencia mensual, dona por tipo y estado, top ubicaciones.
- **Sistema:** login por sesión, 404 propio, `environment.prod.ts` para despliegue.

## API principal

```
POST /api/auth/login | GET /api/auth/me | POST /api/auth/logout
POST /api/reporte (alumno, foto) | PUT /api/reporte/:id (dueño)
PUT  /api/reporte/revisar/:id (personal 1,2) | DELETE /api/reporte/:id (personal)
GET  /api/reporte/mis-reportes | GET /api/reporte/pendientes/estudiante
GET  /api/reporte/estado/:id?page=&limit=&id_tipo_problema=&id_ubicacion=&q=
GET  /api/reporte/top/reacciones | GET /api/reporte/estadisticas/{tipo-problema,ubicacion,por-mes,por-estado,...}
POST|PUT /api/reaccion (alumno, {id_reporte}) | GET /api/reaccion/activos/mios
```

## Convenciones

- Comentarios guía en español al inicio de cada módulo (`// Guía: …`).
- Front: servicios con `{ withCredentials: true }`; identidad de alumno siempre de sesión.
- Validaciones: título 5–150, descripción ≤1000, `id_estado` ∈ {1,2,3}, `like` ∈ {0,1}.
- Paleta amazónica en tokens `--eu-*` (`styles.css`); serif `Fraunces` solo en marca.

## Testing

Sin runner automatizado; verificación por capas:

1. `node --check` en backend y `npm run build` en frontend.
2. E2E manual contra API: login alumno/trabajador, crear → like/unlike → revisar
   (aceptar/actualizar/estado inválido 400) → eliminar (fila + foto), 401/403,
   rutas viejas 404, job `limpiarPendientesAntiguos()` con fila de prueba.
3. Humo en navegador: login, feed, mis reportes, modal trabajador, dashboard,
   consola sin errores.

## Notas

- Proyecto académico UNU: imágenes en disco local y carpeta única responden a
  requisitos de entrega.
- Para despliegue free: ver bloqueos conocidos (MySQL→Postgres, disco efímero→
  storage externo, sesiones, CORS/`secure`, SPA rewrite, cold starts).

## Licencia

Ver `LICENSE`.
