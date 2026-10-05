# Blueprint de Arquitectura — Reportes_UNU

> Documento de referencia para mantener la consistencia arquitectónica.
> Generado del código real (no de la teoría). Última revisión: 2026-10-05.

## 1. Resumen

Sistema web monolítico en 3 capas desplegadas por separado: **SPA Angular** (Vercel)
+ **API Express con sesiones en MySQL** (Render) + **TiDB Cloud** + **Cloudinary**.
Sin tokens ni JWT: la identidad viaja en cookie HTTP-only `sid` y vive en la tabla
`sessions`. Las fotos tienen modo dual (disco local / Cloudinary) decidido por entorno.

```
┌──────────────┐  cookie sid + JSON   ┌──────────────┐  SQL+SSL   ┌────────────┐
│ Angular 19   │ ◄──────────────────► │ Express 5    │ ◄────────► │ TiDB Cloud │
│ (Vercel)     │      CORS + cred.    │ (Render)     │            │  puerto    │
└──────────────┘                      └──────┬───────┘            │  4000      │
                                             │ foto               └────────────┘
                                    ┌────────┴──────┐
                                    │ disco local   │  Cloudinary (prod)
                                    │ (UPLOAD_DIR)  │
                                    └───────────────┘
```

## 2. Stack

| Capa       | Tecnología                                                                |
|------------|---------------------------------------------------------------------------|
| Frontend   | Angular 19 standalone, Angular Material, Chart.js vía `ng2-charts`, RxJS  |
| Backend    | Node.js 20+, Express 5, `mysql2`, `multer` (memoria, 5MB)                 |
| Auth       | `express-session` + `express-mysql-session` (cookie `sid`, 8h) + `bcrypt` |
| Seguridad  | `helmet`, `cors` (origen único), `express-rate-limit` en login            |
| Datos      | MySQL 8 / TiDB Cloud (`utf8mb4`), fotos en Cloudinary en prod             |
| Despliegue | Vercel (front), Render (back, lee `render.yaml`), TiDB Cloud, Cloudinary  |

## 3. Backend: capas y flujo

```
HTTP → helmet → cors → json/urlencoded → session(sid) → rate-limit(login)
  → routes/*.js → middleware (requireSession → requireRole/requireEstudiante)
  → controllers/*.js → config/database.js (pool mysql2) → TiDB
```

- **`routes/`**: solo mapeo URL → middleware → controlador. Nada de lógica.
- **`middleware/`**: `requireSession` (401 si no hay `req.session.auth`),
  `requireRole([1,2])` (403 por rol), `requireEstudiante` (sesión con
  `codigo_estudiante`). El orden es: sesión primero, rol después.
- **`controllers/`**: validan entrada, consultas parametrizadas (`?`) siempre,
  errores 500 genéricos al front y detalle a consola (`[auth.login]`, etc.).
- **`config/storage.js`**: única puerta de fotos (`upload`, `guardarFoto`,
  `reemplazarFoto`, `borrarFoto`, `esNube`). Resto del código no distingue disco/nube.
- **`jobs/limpiarPendientes.js`**: borra pendientes +7 días (fila + foto) una vez
  al día a las 03:00, programado con `setInterval` en `server.js`.
- **`server.js`**: además monta `/uploads`, el 404 JSON y el handler final que
  convierte cualquier error en JSON (el front espera JSON, nunca HTML).

Mapa de rutas (detalle en `backend/routes/`):

```
POST /api/auth/login (rate-limit) | GET /api/auth/me | POST /api/auth/logout
POST /api/reporte (estudiante + foto) | PUT /api/reporte/:id (dueño)
PUT  /api/reporte/revisar/:id (roles 1,2) | DELETE /api/reporte/:id (roles 1,2)
GET  /api/reporte/estado/:id, /top/reacciones, /mis-reportes,
     /pendientes/estudiante, /:id, /estadisticas/*
POST|PUT /api/reaccion (estudiante) | GET /api/reaccion/activos/mios
GET  /api/{estado,tipoProblema,ubicacion,estudiante/:id,trabajador/:id}
POST /api/usuario (verificarUsuario)
```

Lecturas de catálogos, feed y estadísticas son **públicas** (diseño: el feed se ve
sin login); toda escritura exige sesión y rol.

## 4. Modelo de identidad y datos

Roles: `1` Supervisor, `2` Administrador (tabla `usuario`), `3` Estudiante
(**solo vive en sesión**, sin fila en `usuario`).

- Login busca en `usuario` (personal) y si no, en `estudiante` (simula el API
  externo de la UNU: se lee, nunca se escribe desde auth). `bcrypt.compare` en
  ambos casos; mensajes idénticos exista o no (no filtrar usuarios).
- Tras clave válida: `session.regenerate` + `req.session.auth = {...}` y
  `session.save`. La cookie `sid` viaja sola; el front no guarda nada
  (sin `localStorage`, sin `innerHTML` en todo `frontend/src`).

Tablas (`database/*.sql`, solo en local): `estado` (1 Pendiente, 2 Aceptado,
3 Resuelto — no hay Rechazado: rechazar = `DELETE`), `rol`, `tipo_problema`,
`ubicacion`, `trabajador`, `usuario` (FK a `rol` y `trabajador`),
`estudiante` (**sin FK hacia ni desde ella**: referencia lógica por
`codigo_estudiante**), `reporte` (FK a `estado`, `tipo_problema`, `ubicacion`;
`id_usuario` `ON DELETE SET NULL`), `reaccion` (FK a `reporte`
`ON DELETE CASCADE` + `UNIQUE(codigo_estudiante, id_reporte)` con transacción
que mantiene `cantidad_reacciones`), `sessions` (la crea el store si falta).

`foto_url` guarda **ruta relativa** (`/uploads/reportes/xxx.jpg`) en disco o
**URL absoluta** (`https://res.cloudinary.com/...`) en nube. El front las
resuelve con `frontend/src/app/utils/foto-url.ts`: jamás concatenar `baseUrl`
a ciegas.

## 5. Frontend: organización

```
app/
├── components/{auth,estudiante,trabajador,estadistica,not-found}
├── layouts/{estudiante,trabajador}  # shell + navegación por rol
├── guards/{auth.guard,role.guard}   # AuthGuard=¿logueado? RoleGuard=¿rol ok?
├── services/*.service.ts            # HttpClient + { withCredentials: true }
├── models/*.interface.ts            # contratos con el API
├── utils/foto-url.ts                # resuelve foto local vs nube
├── environment/{environment,environment.prod}.ts  # fileReplacements en prod
└── app.routes.ts                    # /login público; /estudiante (rol 3);
                                     # /trabajador (roles 1,2); ** → 404 propio
```

Patrones: componentes standalone, formularios reactivos, servicios finos por
entidad, identidad del alumno siempre tomada de sesión (nunca de un campo del
form), `imgRota($event)` como degradación si la foto no carga.

## 6. Decisiones registradas (ADR resumidos)

1. **Sesiones vs JWT**: sesiones en MySQL por simplicidad de revocación
   (logout = `destroy`) y porque el cliente exigía cookie HTTP-only.
   Consecuencia: el store de sesiones necesita su propia conexión con SSL
   (`express-mysql-session@3` filtra `ssl` de sus opciones → se le pasa un
   pool `mysql2` propio en `server.js`).
2. **Estudiante como API simulada**: sin FK para poder migrar a un API real sin
   tocar el esquema; el rol 3 solo existe en sesión.
3. **Rechazo = borrado total** (sin estado Rechazado): fila + reacciones en
   cascada + foto, tanto manual (`eliminarReporte`) como automático (job +7 días).
4. **Fotos duales por entorno**: mismo código, `CLOUDINARY_URL` decide. En Render
   el disco es efímero → prod siempre a la nube.
5. **Vercel `Output Directory = dist/front/browser`**: el builder `application`
   de Angular 19 anida `index.html` en `browser/`; si se apunta a `dist/front`
   el deploy sale verde pero sirve 404.

## 7. Guía de extensión

- **Nuevo endpoint**: ruta en `routes/<dominio>Route.js` + middleware que
  corresponda + controlador con validación, `?` parametrizados y error genérico.
  Escritura de alumno → `requireEstudiante`; de personal → `requireRole([1,2])`.
- **Nueva vista**: componente standalone + servicio (con `withCredentials`) +
  entrada en `app.routes.ts` bajo el layout de su rol + guards.
- **Nuevo catálogo**: tabla + `GET` público (convención) + servicio + filtro
  en listados (`leerFiltros`/`leerPaginacion` en `reporteController.js`).
- **No hacer**: concatenar SQL, devolver `clave`/hashes, guardar tokens en el
  front, `innerHTML` con datos de usuario, `baseUrl + foto_url` directo.

## 8. Operación

- Variables por entorno (nunca en código): `DB_*`, `DB_SSL`, `SESSION_SECRET`,
  `FRONTEND_ORIGIN`, `COOKIE_SECURE/SAMESITE`, `CLOUDINARY_URL`. `backend/.env`
  es solo local y **no debe commitearse**.
- Orden de despliegue: TiDB → Cloudinary → Render → `environment.prod.ts` →
  Vercel → `FRONTEND_ORIGIN` en Render. Render free se duerme (~30s cold start).
- Diagnóstico: `GET /api/auth/me` 200 sin cookie y 401 con clave mala = back OK;
  500 solo con clave buena = capa de sesión; `<!DOCTYPE... is not valid JSON`
  en el front = el back devolvió HTML (ver handler final en `server.js`).
