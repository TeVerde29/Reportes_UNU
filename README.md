# Reportes_UNU

Sistema de reportes de averías e incidencias del campus de la Universidad Nacional de Ucayali (UNU).
Los estudiantes crean reportes con foto, les dan "like" a los de sus compañeros y el personal de
mantenimiento los revisa (acepta / resuelve / rechaza) y consulta estadísticas.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Angular 19 (standalone), Angular Material 19, `ng2-charts` + Chart.js |
| Backend | Node.js + Express 5, sesiones con `express-session` guardadas en MySQL, `helmet`, `express-rate-limit`, `multer` |
| Base de datos | MySQL (`database/bd_reporte_incidencias.sql`, 9 tablas) |
| Auth | Sesión con cookie `sid` (httpOnly, 8 h), roles por `id_rol`, hash con `bcrypt` |

Roles: `1` Supervisor, `2` Administrador (zona `/trabajador`), `3` Estudiante (zona `/estudiante`).

## Estructura

```
Reportes_UNU/
├── frontend/        # App Angular (puerto dev 4200)
│   └── src/app/     # components/ (auth, estudiante, trabajador, estadistica)
│                    # layouts/, guards/ (AuthGuard, RoleGuard), services/, models/
├── backend/         # API Express (puerto 3000)
│   ├── server.js    # Entrada: helmet → cors → sesión MySQL → rate-limit → rutas → /uploads
│   ├── routes/      # auth, reporte, reaccion, estado, estudiante, trabajador,
│   │                # tipo_problema, ubicacion, usuario
│   ├── controllers/ # Lógica de cada recurso
│   ├── middleware/  # requireSession, requireRole, upload (multer)
│   └── config/      # Conexión MySQL
├── database/        # bd_reporte_incidencias.sql (estado, estudiante, reaccion,
│                    # reporte, rol, tipo_problema, trabajador, ubicacion, usuario)
├── Reportes_UNU_IMG/ # Fotos subidas (uploads/reportes)
├── documentation/   # Informes del proyecto (.docx)
├── Apuntes.md / Observaciones-Completo.md  # Acuerdos y pendientes del equipo
└── Documentacion_Seguridad.md              # Medidas de seguridad del backend
```

## Requisitos

- Node.js 20 LTS o superior (lo exige Angular 19) + Angular CLI (`npm i -g @angular/cli`)
- MySQL en ejecución (local o remoto)

## Instalación

### 1. Base de datos

Importa el script (crea las tablas; la tabla `sessions` la crea sola la API al arrancar):

```bash
mysql -u root -p < database/bd_reporte_incidencias.sql
```

### 2. Backend

```bash
cd backend
npm install
```

Crea `backend/.env` (nombres de variables requeridas):

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_clave
DB_NAME=reporte_incidencias
BCRYPT_ROUNDS=10
SESSION_SECRET=un_secreto_largo
FRONTEND_ORIGIN=http://localhost:4200
COOKIE_SECURE=false   # true solo con https en producción
UPLOAD_DIR=../Reportes_UNU_IMG/uploads/reportes
```

Arranca la API (no hay script `start`; se ejecuta directo):

```bash
node server.js
# o en desarrollo:
npx nodemon server.js
```

Verifica en `http://localhost:3000` (responde JSON con endpoints y estado de sesión).

### 3. Frontend

```bash
cd frontend
npm install
ng serve
```

Abre `http://localhost:4200` (redirige a `/login`). La API base está en
`src/app/environment/environment.ts` → `http://localhost:3000/api`.

## Rutas principales

Frontend (`src/app/app.routes.ts`):

| Ruta | Acceso |
|---|---|
| `/login` | Pública |
| `/estudiante/inicio`, `/nuevo-reporte`, `/editar-reporte/:id` | Rol 3 (guards Auth + Role) |
| `/trabajador/reportes-pendientes|aceptados|solucionados|rechazados`, `/ver-reporte/:id`, `/estadisticas` | Roles 1–2 |

API (`http://localhost:3000/api`):

| Método | Endpoint | Descripción |
|---|---|---|
| POST / GET `/auth/login`, `/auth/me`, `/auth/logout` | Login, sesión actual, salir (login con rate-limit: 30 intentos / 15 min) |
| GET | `/estado`, `/estado/:nombre` | Estados de reporte |
| GET | `/estudiante/:id` | Datos del estudiante (requiere sesión) |
| GET / POST / PUT | `/reaccion/:id`, `/reaccion` | Likes activos, dar / quitar like (rol 3) |
| POST / PUT | `/reporte`, `/reporte/:id` | Crear / editar reporte con foto (rol 3) |
| GET | `/reporte/mis-reportes/:id`, `/reporte/pendientes/estudiante/:id` | Reportes del alumno |
| PUT | `/reporte/revisar/:id` | Aceptar / resolver / rechazar (roles 1–2) |
| GET | `/reporte/estado/:id`, `/reporte/top/reacciones`, `/reporte/:id` | Feed por estado, populares, detalle |
| GET | `/reporte/estadisticas/...` | Por tipo-problema, ubicación, ambos y por mes (dashboard) |
| GET | `/tipoProblema`, `/ubicacion`, `/ubicacion/:id`, `/trabajador/:id` | Catálogos y trabajador |

Las fotos se sirven en `/uploads/reportes/...`.

## Notas y riesgos conocidos

- El backend no tiene script `start`/`dev` en `package.json`; se arranca con `node server.js`.
- `auth.service.ts` lleva la URL `http://localhost:3000/api/auth` fija; el resto de servicios usa `environment.apiUrl`. En despliegue hay que alinear ambas.
- `COOKIE_SECURE=false` solo vale para desarrollo en http; en producción con https debe ser `true`.
- Hay decisiones pendientes del equipo en `Apuntes.md` (puntos 1–5: borrado de rechazados, purga de pendientes, rol Estudiante, paginación, validación de fotos).
