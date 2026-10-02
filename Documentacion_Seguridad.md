# Documentación de Seguridad — Reportes_UNU
Guía para estudiar paso a paso. Lenguaje simple, sin tecnicismos raros.

> Proyecto estudiantil (máx. 7000 alumnos UNU). Seguridad adecuada para
> despliegue de clase, no empresarial con miles de conexiones por segundo.

---

## 0. Mapa rápido (¿dónde está cada cosa?)

```
BACK  backend/server.js                  → enciende todo + casco + freno + sesiones
BACK  backend/middleware/requireSession.js → puerta 1: ¿logueado?
BACK  backend/middleware/requireRole.js     → puerta 2: ¿rol correcto?
BACK  backend/routes/authRoute.js            → entrar / quién soy / salir
BACK  backend/controllers/authController.js → revisa clave y crea sesión
BACK  backend/routes/reporteRoute.js         → quién puede crear/revisar reportes
BACK  backend/routes/reaccionRoute.js        → quién puede dar like
BACK  backend/routes/estudianteRoute.js, trabajadorRoute.js, usuarioRoute.js
BACK  backend/config/database.js             → conexión MySQL (siempre con `?`)
BACK  backend/controllers/reporteController.js (arriba) → subida de fotos

FRONT frontend/src/app/services/auth.service.ts → pide login/me/logout
FRONT frontend/src/app/guards/auth.guard.ts    → ¿logueado? (pregunta al back)
FRONT frontend/src/app/guards/role.guard.ts    → ¿rol correcto?
FRONT frontend/src/app/app.routes.ts           → /estudiante solo rol 3, /trabajador solo 1-2
FRONT frontend/src/app/components/auth/login-form/login-form.component.ts
FRONT frontend/src/app/layouts/.../layout-*.component.ts → botón salir

BD   database/bd_reporte_incidencias.sql → tablas del negocio
BD   tabla `sessions` (la que agregaste) → cajón de sesiones
```

Roles: `1 = Supervisor, 2 = Administrador, 3 = Estudiante` (tabla `rol`).

---

## 1. Idea general en 5 líneas

1. Escribes `código + clave` en el login.
2. El back revisa la clave revuelta (`bcrypt`) y te abre una **sesión**.
3. Te da una **cookie `sid`** (un ticket con número al azar, no tus datos).
4. Tu navegador la manda sola en cada pedido (`withCredentials: true`).
5. El back mira el ticket en la tabla **`sessions`**: si existe y no venció (8h),
   pasa las 2 puertas (`requireSession` + `requireRole`).

Nada se guarda en `localStorage`. Si borras la cookie o pasan 8h, sales.

---

## 2. La ruta completa, paso a paso

### Paso 1 — Login `POST /api/auth/login`
Archivo: `backend/controllers/authController.js` → `login()`

```
Front manda: { "codigo": "0002221081", "clave": "123456" }
```

1. Revisa que vengan los 2 datos → si falta, `400 Datos incompletos`.
2. Busca en `usuario` por `codigo` (los que ya tienen cuenta).
3. Si no está, busca en `estudiante` por `codigo`.
   Esta tabla simula la **API de alumnos**: solo se lee, no tiene llaves
   a otras tablas. Si es su primer login, le crea su `usuario` con `id_rol = 3`.
4. Compara con `bcrypt.compare(clave, claveGuardada)`.
   Si falla → `401 Credenciales inválidas` (mismo mensaje exista o no,
   para no dar pistas).
5. Crea sesión nueva (`crearSesionNueva` = `regenerate + save`).
   Esto evita **fijación de sesión** (que te pasen un ticket viejo).
6. Guarda: `req.session.auth = { id_usuario, id_rol, id_estudiante, id_trabajador }`
   Eso se escribe en la tabla `sessions`, columna `data`.
7. Responde: `{ success:true, data: { id_rol: 3, ... } }`
   y el navegador guarda la cookie `sid`.

Freno: `backend/server.js` → `loginFreno` deja 30 intentos por IP cada
15 min. Frena robots que prueban claves, no molesta a 7000 alumnos.

### Paso 2 — Cookie `sid` y tabla `sessions`
Archivos: `backend/server.js` (sesión) + tabla `sessions`.

```sql
sessions(session_id, expires, data)
-- ejemplo data: {"cookie":{...},"auth":{"id_usuario":3,"id_rol":3,...}}
```

- `session_id` = número al azar de la cookie.
- `expires` = vencimiento en segundos (8h).
- `data` = quién eres + qué rol tienes.

Cookie: `httpOnly` (el JS no la lee → frena robo por XSS),
`sameSite: lax` (viaja en tu web → frena CSRF básico),
`secure: false` en clase, `true` con https en despliegue (`.env: COOKIE_SECURE`).
`secret: SESSION_SECRET` firma la cookie para que nadie la falsifique.

Puedes verla: `SELECT session_id, FROM_UNIXTIME(expires), LEFT(data,80) FROM sessions;`

### Paso 3 — "¿Quién soy?" `GET /api/auth/me`
Archivo: `backend/controllers/authController.js` → `me()`

El front la llama después del login y en cada guardia.
Si hay sesión → `{ data: { id_rol, ... } }`.
Si no → `{ data: null }` (no es error, es "nadie").

### Paso 4 — Puertas del back
Archivos: `middleware/requireSession.js` y `middleware/requireRole.js`

Toda ruta protegida pasa así:

```
cookie sid → ¿sesión existe? (requireSession, si no → 401)
           → ¿rol permitido? (requireRole([..]), si no → 403)
           → controlador
```

- `401` = no logueado. `403` = logueado pero sin permiso.
- `requireRole` se usa así: `requireRole([3])` solo estudiantes,
  `requireRole([1,2])` solo personal. Siempre después de `requireSession`.

### Paso 5 — Qué pide cada ruta (matriz)

| Acción | Ruta | Pide |
|---|---|---|
| Login | `POST /api/auth/login` | nada + freno 30/15min |
| Quién soy | `GET /api/auth/me` | nada (devuelve null si no hay) |
| Salir | `POST /api/auth/logout` | nada (borra sesión + cookie) |
| Crear reporte | `POST /api/reporte` | sesión + rol 3 |
| Editar mi reporte | `PUT /api/reporte/:id` | sesión + rol 3 (antes estaba público, se cerró) |
| Revisar (aceptar/rechazar) | `PUT /api/reporte/revisar/:id` | sesión + roles 1,2 |
| Mis pendientes / mis reportes | `GET /api/reporte/pendientes/...`, `/mis-reportes/...` | sesión |
| Ver reporte / ranking / estado | `GET /api/reporte/:id`, `/estado/:id`, `/top/...` | público (para el inicio) |
| Estadísticas | `GET /api/reporte/estadisticas/*` | público (las mira el dashboard ya logueado) |
| Dar/quitar like | `POST /api/reaccion`, `PUT /api/reaccion` | sesión + rol 3 |
| Ver likes | `GET /api/reaccion/:id` | sesión |
| Perfil alumno/trabajador | `GET /api/estudiante/:id`, `/api/trabajador/:id` | sesión |
| Verificar usuario | `POST /api/usuario` | sesión (no la usa el front, quedó interna) |
| Catálogos | `GET /api/estado`, `/api/tipoProblema`, `/api/ubicacion` | público (listas simples, sin datos personales) |

### Paso 6 — Puertas del front
Archivos: `guards/auth.guard.ts`, `guards/role.guard.ts`, `app.routes.ts`

1. Entras a `/estudiante/inicio` o `/trabajador/...`.
2. `AuthGuard` llama a `GET /me` con la cookie. Si no hay `id_rol` → `/login`.
3. `RoleGuard` lee `data: { roles: [...] }` de la ruta y compara con
   `me().data.id_rol`. Si no coincide → `/login`.
4. `app.routes.ts`: `/estudiante` → `roles: [3]`,
   `/trabajador` → `roles: [1,2]`.

El login (`login-form.component.ts`) hace lo mismo al revés:
si ya hay sesión, te redirige solo: rol 3 → `/estudiante/inicio`,
roles 1-2 → `/trabajador/reportes-pendientes`.

Todos los servicios mandan `{ withCredentials: true }`.
Sin eso la cookie no viaja y el back cree que no hay nadie.

### Paso 7 — Logout `POST /api/auth/logout`
Archivos: `authController.js` → `logout()` + `layout-*.component.ts` → `logout()`

1. Front (botón salir en el layout) llama a `/logout`.
2. Back hace `req.session.destroy` (borra la fila en `sessions`)
   + `clearCookie('sid')` (borra el ticket en el navegador).
3. Front te manda a `/login` aunque falle.

### Paso 8 — Capas que no se ven pero protegen
Archivo: `backend/server.js`

- `helmet()` = casco: pone cabeceras que frenan XSS/clickjacking.
- `cors({ origin: FRONTEND_ORIGIN, credentials: true })` =
  solo tu front puede pedir con cookie. Si cambias de URL al desplegar,
  cambia `FRONTEND_ORIGIN` en `.env`.
- `trust proxy = 1` = deja que la cookie `secure` funcione detrás de
  Nginx/Render/Railway.
- Consultas con `?` (`WHERE codigo = ?`) = nunca pego tu texto al SQL,
  así freno **inyección SQL**. Vale para las 7000 cuentas.
- Fotos (`reporteController.js` arriba): solo `jpg/jpeg/png/webp`,
  máx 5MB, nombre al azar de 32 letras. No guardo tu nombre original
  para que nadie adivine rutas ni suba `.exe/.php` disfrazados.

---

## 3. Cómo probarlo tú (orden para estudiar)

1. `GET /` → mira `sesion_actual.autenticado: false`.
2. `POST /api/auth/login` con código malo → `401`, y el freno cuenta.
3. Login bueno (ej: `0002221081`) → mira la cookie `sid` en DevTools
   y la fila nueva en `sessions`.
4. `GET /api/auth/me` → trae tu `id_rol`.
5. Sin cookie: `POST /api/reporte` → `401`. Con rol 3: pasa.
   Con rol 3 a `PUT /revisar/:id` → `403`.
6. En el front: entra a `/trabajador/reportes-pendientes` con alumno
   → te devuelve a `/login` (RoleGuard).
7. `POST /api/auth/logout` → `me` vuelve a `null` y la fila se borra.

---

## 4. Despliegue (checklist)

```
.env: SESSION_SECRET largo y único (no el de ejemplo)
.env: FRONTEND_ORIGIN = URL real del front
.env: COOKIE_SECURE = true (solo con https)
.env: DB_* apuntando a la BD real
Server: app.set('trust proxy',1) ya está puesto
Tabla `sessions` creada (tu .sql nuevo)
Carpeta UPLOAD_DIR existe y con permiso de escritura
```

---

## 5. Errores comunes

- `401` en todo aun logueado → olvidaste `withCredentials: true`
  o `FRONTEND_ORIGIN` no es la URL del front.
- Cookie no se guarda en despliegue → falta `https` + `COOKIE_SECURE=true`
  + `trust proxy`.
- `403` en revisar → entraste con rol 3, esa acción es de personal.
- Sesiones se borran al reiniciar → no estás usando el `store` MySQL
  (revisa `server.js` → `sessionStore`).
- Tabla `sessions` gigante → el `clearExpired` cada 15 min la limpia sola.

## 6. Lo que NO debes hacer

- No guardes `clave` sin `bcrypt`, ni la compares con `===`.
- No pongas la sesión en `localStorage`.
- No quites `requireSession` de `PUT /:id` (ya se cerró ese hueco).
- No subas `.env` a Git (tiene la clave de sesiones y la BD).
- No cambies `sameSite` a `none` sin `secure:true`.
