# Reportes_UNU — Sistema de Reporte de Incidencias

Aplicación web para que los estudiantes de la UNU reporten incidencias (infraestructura,
mobiliario, equipos, etc.) y el personal las revise (pendiente / aceptado / resuelto / rechazado),
con likes y estadísticas.

## Stack

- **Backend:** Node.js + Express 5 + `mysql2` + `express-session` (auth por sesión con cookie `sid`)
- **Frontend:** Angular 19 + Angular Material + `ng2-charts` / Chart.js
- **BD:** MySQL 8/9 — script en `database/bd_reporte_incidencias.sql`
- Probado con Node v22 + npm 10.

## Estructura

```
Reportes_UNU/
├── backend/        # API Express (puerto 3000). Ver backend/.env.example
├── frontend/       # App Angular (puerto 4200)
├── database/       # Script SQL canónico de la BD
├── documentation/  # Informes del proyecto
└── README.md
```

> Las imágenes de reportes se guardan en disco local del PC:
> `C:\Reportes_UNU_IMG\uploads\reportes` (la carpeta se crea sola al subir la primera foto).
> El `backend/.env` nunca se commitea (ver `backend/.gitignore`); usa `backend/.env.example` como plantilla.

## Puesta en marcha

### 1. Base de datos

```sql
-- En MySQL Workbench o CLI, ejecuta:
SOURCE database/bd_reporte_incidencias.sql;
```

### 2. Backend

```bash
cd backend
npm install
copy .env.example .env      # luego edita DB_PASSWORD, SESSION_SECRET, etc.
node server.js              # http://localhost:3000
```

### 3. Frontend

```bash
cd frontend
npm install
npm start                   # http://localhost:4200
```

## Variables de entorno (`backend/.env`)

| Variable | Ejemplo |
|---|---|
| `PORT` | `3000` |
| `DB_HOST` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | `localhost` / `root` / `***` / `reporte_incidencias` |
| `BCRYPT_ROUNDS` | `10` |
| `SESSION_SECRET` | clave larga y secreta |
| `FRONTEND_ORIGIN` | `http://localhost:4200` |

## Usuarios de prueba (columna `codigo` en tabla `usuario`)

| Código | Rol |
|---|---|
| `0001111000` | Supervisor (trabajador) |
| `0002222000` | Administrador (trabajador) |
| `0002221081` / `0002221057` / `0002210376` | Estudiante |

Las claves son las cargadas en la BD. Para resetear una: genera el hash y actualízalo.

```bash
cd backend
node test/hash.js MiClave123
# UPDATE usuario SET clave = '<hash>' WHERE codigo = '0002221081';
```

## Notas del proyecto (contexto académico)

- La tabla `estudiante` **simula la API de alumnos de la UNU**: por eso no tiene FK hacia
  `usuario`/`reporte`. Todo acceso a datos de estudiante debería pasar por esa tabla como si
  fuera un servicio externo.
- Las fotos se guardan en el PC local (requisito del proyecto UNU), no en la BD: solo se
  guarda la ruta en `reporte.foto_url`.

## Pendientes conocidos

- Proteger con sesión las rutas públicas de escritura (`PUT /api/reporte/:id`, reacciones) y
  validar roles en el `AuthGuard` del frontend.
- Reordenar `GET /api/reporte/estadisticas/*` antes de `GET /api/reporte/:id` en
  `backend/routes/reporteRoute.js` (hoy las estadísticas caen en "por id").
- No usar `id_estudiante` del body/URL teniendo sesión: usar `req.session.auth`.
- `estudianteController.obtenerEstudiantePorId` usa `SELECT *` (expone `clave` y PII).
- Parametrizar la carpeta de uploads con variable de entorno en vez de ruta fija `C:\...`.
