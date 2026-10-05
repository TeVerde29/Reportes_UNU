# Reportes_UNU — Sistema de Reportes de Averías e Incidencias

> Aplicación web para reportar incidencias dentro de la UNU (infraestructura, mobiliario,
> equipos electrónicos, instalaciones eléctricas y sanitarias, áreas verdes, seguridad y limpieza).

<p align="center">
  <img src="https://img.shields.io/badge/Estado-Activo-0f9488?style=for-the-badge" alt="Estado: activo">
  <img src="https://img.shields.io/badge/Frontend-Angular_19-dd0031?style=for-the-badge&logo=angular&logoColor=ffffff" alt="Angular 19">
  <img src="https://img.shields.io/badge/Backend-Express_5-000000?style=for-the-badge&logo=express&logoColor=ffffff" alt="Express 5">
  <img src="https://img.shields.io/badge/BD-TiDB_Cloud-2563eb?style=for-the-badge&logo=mysql&logoColor=ffffff" alt="TiDB Cloud">
  <img src="https://img.shields.io/badge/Fotos-Cloudinary-3448c5?style=for-the-badge&logo=cloudinary&logoColor=ffffff" alt="Cloudinary">
  <img src="https://img.shields.io/badge/Licencia-MIT-64748b?style=for-the-badge" alt="Licencia MIT">
</p>

<p align="center">
  <img src="./img/login.png" alt="Inicio de sesión de Reportes UNU" width="640">
  <img src="./img/inicio-estudiante.png" alt="Feed de reportes del estudiante" width="640">
  <img src="./img/detalle-reporte.png" alt="Detalle de incidencia con evidencia visual" width="640">
  <img src="./img/aceptados-admin.png" alt="Módulo de aceptados del trabajador" width="640">
</p>

<p align="center">
  <img src="./img/login-movil.png" alt="Inicio de sesión en móvil" width="260">
  <img src="./img/inicio-movil.png" alt="Feed del estudiante en móvil" width="260">
  <img src="./img/nuevo-reporte-movil.png" alt="Generando un reporte en móvil" width="260">
  <img src="./img/datos-movil.png" alt="Dashboard de reportes en móvil" width="260">
</p>

Los estudiantes crean reportes con foto, les dan like a los reportes aceptados y hacen
seguimiento a los suyos. El personal (supervisor/administrador) revisa los pendientes,
los acepta, resuelve o los elimina (rechazo = borrado total), y consulta estadísticas
por tipo de problema, ubicación, mes y estado.

## Producción

| Capa     | URL                                              |
|----------|--------------------------------------------------|
| Frontend | https://reportes-unu.vercel.app                  |
| Backend  | https://reportes-unu.onrender.com                |

Base de datos en TiDB Cloud y fotos en Cloudinary.

## Stack

| Capa      | Tecnología                                                                |
|-----------|---------------------------------------------------------------------------|
| Backend   | Node.js v22 + Express 5 + `mysql2` + `multer`                             |
| Auth      | `express-session` + `express-mysql-session` (cookie `sid`, 8h) + `bcrypt` |
| Seguridad | `helmet`, `cors`, `express-rate-limit` (login)                            |
| Frontend  | Angular 19 standalone + Angular Material + Chart.js (`ng2-charts`)        |
| BD        | MySQL 8 (`utf8mb4`) / TiDB Cloud — scripts SQL solo en local (ignorados en git) |

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
SOURCE database/bd_reporte_incidencias.sql;  -- script local (no se commitea) + sessions (vacía)
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
DB_PORT=3306
DB_SSL=false        # true en nube (TiDB exige SSL)
BCRYPT_ROUNDS=10
SESSION_SECRET=una_clave_larga_y_secreta
FRONTEND_ORIGIN=http://localhost:4200
COOKIE_SECURE=false
UPLOAD_DIR=C:/Reportes_UNU/Reportes_UNU_IMG/uploads/reportes

# Solo en despliegue (nube). Si faltan, todo sigue en local.
# CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
# CLOUDINARY_FOLDER=reportes_unu
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
│                   # estadistica}, layouts/, guards/, services/, models/,
│                   # utils/foto-url.ts (resuelve URL de foto local vs nube)
├── database/       # SQL locales (bd_reporte_incidencias.sql, bd_tidb.sql),
│                   # NO se commitean (ver .gitignore)
├── documentation/  # Informes del proyecto
├── Reportes_UNU_IMG/uploads/reportes/  # Fotos (no se commitea el contenido)
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
- **Modo dual local/nube:** mismo código, decide por entorno. Sin `CLOUDINARY_URL`
  guarda fotos en disco; con ella sube a Cloudinary (`backend/config/storage.js`).
  `DB_SSL=true` + `DB_PORT` para TiDB. Sesiones y SQL funcionan igual en ambos.
- Para despliegue free paso a paso:
  1. **TiDB Cloud** (gratis): cluster Serverless, copia host/puerto/usuario/clave;
     importa el SQL local una vez (los `.sql` no están en el repo).
  2. **Cloudinary** (gratis): copia el `CLOUDINARY_URL` del dashboard.
  3. **Render** (gratis): New → Web Service con este repo (lee `render.yaml`);
     pega las variables de TiDB + `CLOUDINARY_URL`; anota su URL.
  4. **Front:** pon esa URL en `frontend/src/app/environment/environment.prod.ts`
     (`apiUrl` y `baseUrl`), commit y despliega en **Vercel** (`vercel.json` ya
     trae el rewrite SPA). Copia la URL del front.
  5. **Vuelve a Render** y pon `FRONTEND_ORIGIN` con la URL de Vercel
     (`COOKIE_SECURE=true`, `COOKIE_SAMESITE=none` ya van en `render.yaml`).
  Ojo: cold starts (~30s la primera carga) y disco efímero (por eso las fotos
  van a la nube).
- Detalles que ya mordieron en producción (no tocar sin leer):
  1. **Vercel → Output Directory** debe ser `dist/front/browser` (el builder
     `application` de Angular 19 mete `index.html` en `browser/`). Si apunta a
     `dist/front` el deploy sale verde pero sirve 404.
  2. **Sesiones en TiDB:** `express-mysql-session@3` filtra sus opciones y
     elimina `ssl`; el store se crea con un pool `mysql2` propio ya con SSL
     (`backend/server.js`). Sin eso, login con clave correcta da 500.
  3. **Fotos:** en BD se guarda ruta relativa (disco) o URL absoluta
     (Cloudinary). El front las resuelve con `utils/foto-url.ts`; nunca
     concatenar `baseUrl` a ciegas.

## Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo `LICENSE` para más detalles.

---

## Autor

**Pedro Giovanni Ricra Figueroa**
Estudiante de Ingeniería de Sistemas — Universidad Nacional de Ucayali

- GitHub: [@TeVerde29](https://github.com/TeVerde29)
- LinkedIn: [Pedro Giovanni Ricra Figueroa](http://www.linkedin.com/in/pedro-giovanni-ricra-figueroa-971a20433)
- Email: pedro.ricra.figueroa@gmail.com

---

<div align="center">

Si este proyecto te resultó útil, considera darle una estrella en GitHub.

</div>
