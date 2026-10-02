# Observaciones - Reportes_UNU (versión sustentable para 7k alumnos)

> `estudiante` se trata como **simulación de API externa**: se acepta que no tenga FK, pero entonces no debe permitir borrados ni duplicados.

---

## 1. [P0][Back-Seg] IDOR: se confía en `id_estudiante` / `id_usuario` del cliente

**Qué es paso a paso:**
1. El navegador manda un JSON como `{ id_estudiante: 5, titulo: "..." }`.
2. El backend lo usa directo para `INSERT` sin preguntar quién eres en sesión.
3. Cualquiera con Postman cambia el `5` por `6` y crea/vota/ve como otro alumno.

**Por qué es grave con 7000 alumnos:** suplantación masiva, votos falsos, reportes a nombre ajeno. Es lo primero que un jurado prueba.

**Dónde:**
- `backend/controllers/reporteController.js:62,69,94` - `crearReporte` lee `req.body.id_estudiante`
- `backend/controllers/reporteController.js:121-154` - `actualizarReporte` no compara con sesión + acepta `id_estado,id_usuario` del body
- `backend/controllers/reaccionController.js:24,112` - `darLike/quitarLike` leen `req.body.id_estudiante`
- `backend/routes/reporteRoute.js:33-34` - `GET /pendientes/estudiante/:id` y `/mis-reportes/:id` solo piden sesión, no que `:id == tu id`

**Cómo arreglarlo paso a paso:**
1. En `middleware/requireSession.js` ya guardas `req.session.auth`. Úsalo como verdad.
2. En `crearReporte`: borra `const {id_estudiante} = req.body` y pon `const id_estudiante = req.session.auth.id_estudiante;`
3. En `actualizarReporte`: primero `SELECT id_estudiante FROM reporte WHERE id=?`, si `!== req.session.auth.id_estudiante` devuelve `403`. No aceptes `id_estado,id_usuario` del body para rol 3.
4. En `darLike/quitarLike`: igual, `id_estudiante = req.session.auth.id_estudiante`.
5. En `GET /mis-reportes/:id` y `/pendientes/estudiante/:id`: si `Number(req.params.id) !== req.session.auth.id_estudiante` y tu rol no es 1/2, devuelve `403`.
6. Prueba: loguéate como alumno A, intenta `POST /api/reporte` con `id_estudiante` de B. Debe ignorarlo y usar el tuyo.

## 2. [P0][Back-Seg] `POST /api/usuario` permite enumerar cuentas sin login

**Qué es:**
1. `backend/controllers/usuarioController.js:4-32` hace `SELECT + bcrypt.compare` igual que login.
2. Pero no tiene `rateLimit` ni exige sesión.
3. Un robot puede probar `codigo+clave` infinitas veces para saber qué códigos existen.

**Dónde:** `backend/routes/usuarioRoute.js:14` + `usuarioController.js:4-32`.

**Arreglo paso a paso:**
1. Opción recomendada para curso: elimínala si `POST /api/auth/login` ya hace lo mismo. Borra la ruta.
2. Si la necesitas: añade `requireSession` + súmala al `loginFreno` en `server.js:82`: `app.use(['/api/auth/login','/api/usuario'], loginFreno);`
3. Devuelve siempre `401 Credenciales inválidas`, nunca `usuario no existe` vs `clave mal`.

## 3. [P0][Back] Sin validación: solo checks de presencia

**Qué es:**
1. Solo hacen `if(!titulo) return 400`.
2. No validan tipo, largo, entero, formato.
3. Pasa `titulo` de 500 chars a columna `varchar(30)` -> error 500. Pasa `id=abc` -> SQL devuelve 500.

**Dónde:** `authController.js:34`, `reporteController.js:69,130,181`, `reaccionController.js:25,113`. `package.json` no tiene `express-validator/joi/zod`.

**Arreglo paso a paso (mínimo sin librería):**
1. Crea `backend/middleware/validate.js` con helpers: `esEnteroPositivo(v)`, `esTexto(v,min,max)`.
2. En cada controlador antes del SQL:
   ```js
   if(!esEnteroPositivo(req.params.id)) return res.status(400).json({success:false,message:'Id inválido'});
   if(!esTexto(titulo,5,100)) return res.status(400).json({success:false,message:'Título 5-100 caracteres'});
   ```
3. Recorta con `.trim()` siempre.
4. Si quieres hacerlo bien: `npm i express-validator` y valida `body('titulo').isLength({min:5,max:100}).trim()`.

## 4. [P0][Back] Sin manejador global + errores Multer devuelven HTML

**Qué es:**
1. Cada controlador tiene su `try/catch`, pero no hay middleware final de 4 args.
2. Si `multer` falla (archivo >5MB, MIME malo en `reporteRoute.js:32,37`), Express devuelve página HTML 500, el front espera JSON y se rompe.

**Dónde:** `backend/server.js:147-152` solo tiene 404, no hay `(err,req,res,next)`.

**Arreglo paso a paso:**
1. Al final de `server.js`, después del 404, añade:
   ```js
   app.use((err,req,res,next)=>{
     if(err instanceof multer.MulterError){
       return res.status(400).json({success:false,message: err.code==='LIMIT_FILE_SIZE'?'Foto max 5MB':'Error en foto'});
     }
     if(err) return res.status(400).json({success:false,message:err.message||'Archivo inválido'});
     next();
   });
   app.use((err,req,res,next)=>{ console.error(err); res.status(500).json({success:false,message:'Error interno'}); });
   ```
2. Requiere `const multer = require('multer');` arriba.
3. Prueba subiendo 6MB -> debe dar JSON 400, no HTML.

## 5. [P0][BD] Cero paginación (`LIMIT/OFFSET`)

**Qué es:**
1. Ningún `SELECT` en `reporteController.js:252-531` tiene `LIMIT`.
2. `GET /reporte/estado/:id`, `/top/reacciones`, `/mis-reportes/:id` devuelven el 100%.
3. Con 7000 alumnos x N reportes = respuesta de MBs, tumba MySQL + front.

**Arreglo paso a paso (suficiente para 7k, sin Redis):**
1. En cada listado cambia a:
   ```sql
   SELECT ... FROM reporte ... WHERE id_estado=? ORDER BY fecha_reporte DESC LIMIT ? OFFSET ?
   ```
2. En Express: `const page = Math.max(1, Number(req.query.page)||1); const limit=20; const offset=(page-1)*limit;`
3. Devuelve `{ data: rows, page, limit, total: count }`. Para `total` haz `SELECT COUNT(*) ...` con mismo WHERE.
4. En Angular: pide `?page=1` y botón Siguiente/Anterior. No necesitas cursor ni caché.

## 6. [P0][BD] Sin `UNIQUE`: duplicados y doble-like

**Qué es:**
1. Sin `UNIQUE`, MySQL acepta dos alumnos con mismo `codigo/dni/correo`, y dos likes del mismo alumno al mismo reporte.
2. Hoy la unicidad depende solo de código JS, si hay 2 clics a la vez se cuela doble.

**Dónde:** falta en `database/bd_reporte_incidencias.sql` para `estudiante.codigo/dni/correo`, `usuario.codigo/id_estudiante`, `reaccion(id_estudiante,id_reporte)`.

**Arreglo paso a paso:**
1. Ejecuta una vez (limpia duplicados antes):
   ```sql
   ALTER TABLE estudiante ADD UNIQUE KEY uq_est_codigo (codigo);
   ALTER TABLE estudiante ADD UNIQUE KEY uq_est_dni (dni);
   ALTER TABLE estudiante ADD UNIQUE KEY uq_est_correo (correo);
   ALTER TABLE usuario ADD UNIQUE KEY uq_usu_codigo (codigo);
   ALTER TABLE usuario ADD UNIQUE KEY uq_usu_est (id_estudiante);
   ALTER TABLE reaccion ADD UNIQUE KEY uq_reacc (id_estudiante, id_reporte);
   ```
2. Actualiza `bd_reporte_incidencias.sql` con esas líneas para que la entrega ya lo tenga.
3. En `reaccionController.js` captura `ER_DUP_ENTRY` y devuelve `409 Ya diste like`.

## 7. [P0][Seg] Secretos en git + `SESSION_SECRET` débil

**Qué es paso a paso:**
1. `backend/.env` está trackeado (`git ls-files` lo lista). No hay `.gitignore` en raíz.
2. `SESSION_SECRET=pon_una_clave...` es de diccionario + `server.js:63` tiene fallback `|| 'dev_secret_change_me'`. Si falta env en despliegue, firma con clave pública conocida.
3. `DB_USER=root` + clave débil de 6 dígitos.

**Arreglo paso a paso (rotar secretos):**
1. Genera secreto nuevo: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` y cópialo.
2. Crea `.gitignore` en raíz `C:\Reportes_UNU\.gitignore` con:
   ```
   backend/.env
   backend/uploads/
   Reportes_UNU_IMG/
   frontend/dist/
   ```
3. Saca el .env de git: `git rm --cached backend/.env` + `git commit -m "sacar secretos"`.
4. En `server.js:63` quita fallback: `if(!process.env.SESSION_SECRET) throw new Error('Falta SESSION_SECRET');`
5. En MySQL: `ALTER USER 'root'@'localhost' IDENTIFIED BY 'nueva_clave_larga_20+';` o mejor crea usuario `reportes` solo con permisos a esa BD.
6. Cambia `.env` local y el de despliegue, nunca los subas. El README ya dice "no se commitea" pero hoy sí se commitea.

## 8. [P0][Seg] `npm update`: 9 vulns (6 high)

**Qué es:** `npm audit` reporta `multer<=2.2.0` (DoS+bypass fileFilter), `mysql2<=3.23.0`, `path-to-regexp`, `qs/body-parser`.

**Arreglo paso a paso:**
1. `cd backend` -> `npm audit` (ver 9).
2. `npm update multer mysql2 cors express-session dotenv nodemon` -> `multer 2.0.2->2.4.0` corrige lo grave, `mysql2 3.15.3->3.24.5`.
3. `npm audit fix` (sin `--force`). Si pide `--force` por `express-mysql-session`, no lo hagas en curso, documenta como riesgo aceptado.
4. Verifica `npm audit` queda en 0 o solo low. Congela con `npm install` limpio antes de sustentar.

## 9. [P1][Back] Rutas de lectura públicas exponen PII + `GET /` filtra sesión

**Qué es:**
1. `reporteRoute.js:40-48` deja sin sesión `GET /:id, /estado/:id, /top/reacciones, /estadisticas/*`. Devuelven `CONCAT(nombres...)+escuela`. Cualquiera enumera alumnos.
2. `server.js:130-134` devuelve `auth: req.session.auth` en `/`.

**Arreglo paso a paso:**
1. Decide 1 sola pública si tu inicio la necesita (ej. `/top/reacciones` sin nombres, solo `titulo+foto+cantidad`). Al resto pon `requireSession`.
2. En `server.js` cambia `auth: req.session.auth || null` por `autenticado: !!req.session.auth` (sin objeto).
3. Si dejas una pública, ponle `rateLimit` suave: `max:100/15min`.

## 10. [P1][Back] Detalles de sesión/cookie/crypto

**a) `Math.random` para nombres:** `reporteController.js:8-18`. Paso: cambia a `crypto.randomBytes(16).toString('hex')`. Requiere `const crypto=require('crypto')`.
**b) `BCRYPT_ROUNDS` ignorado:** `.env:11` dice 10 pero `authController.js:52,92,109` hardcodea 10. Paso: `const ROUNDS = Number(process.env.BCRYPT_ROUNDS)||10; bcrypt.hash(clave,ROUNDS)`.
**c) `clearCookie` no borra:** `authController.js:168-182` hace `clearCookie('sid')` sin flags. Paso: `res.clearCookie('sid',{httpOnly:true,sameSite:'lax',secure:process.env.COOKIE_SECURE==='true',path:'/'})`.
**d) `actualizarReporte` sin rollback:** `reporteController.js:122-149` hace `rename` a `.bak` sin revertir. Paso mínimo: si `UPDATE` falla, `rename(bak, original)` de vuelta; o mejor: borra foto vieja solo si `UPDATE` fue OK.
**e) `secure:false`:** no es bug en local. Paso para despliegue: `COOKIE_SECURE=true` + HTTPS, `trust proxy 1` ya está en `server.js:33`.

## 11. [P1][Back] Rate-limit solo en login + upload solo MIME/ext

**Qué es:** `server.js:75-82` frena `POST /api/auth/login 30/15min` (bien para 7k), pero `/api/usuario`, `/reaccion`, `/reporte` sin freno. Upload en `reporteController.js:34-56` solo mira extensión+MIME (`image/jpg` ni siquiera es estándar, falta `image/webp` real), no magic-bytes.

**Arreglo paso a paso (nivel curso, sin antivirus):**
1. Añade freno global suave en `server.js`: `app.use('/api/', rateLimit({windowMs:15*60*1000,max:300}))` + mantén el estricto en login.
2. Upload: `npm i file-type`, en `fileFilter` o después de guardar lee los primeros bytes y rechaza si no es jpg/png/webp real. Sirve con `express.static` actual, no necesitas S3 para 7k.
3. Corrige `allowedMimes` a `['image/jpeg','image/png','image/webp','image/gif']`.

## 12. [P1][Front] Rutas rotas + `withCredentials` faltante + validación front

**Qué es paso a paso:**
1. `reporte-form.component.ts:185,206,226` hace `navigate(['/mis-reportes'])` y `['/inicio']` que no existen (`app.routes.ts:43-45` son `/estudiante/...`). Nunca redirige bien al editar.
2. `estudiante.service.ts:15` es el único sin `{withCredentials:true}` -> pierde cookie `sid`.
3. Form trabajador `pendientes-form.component.ts:29-33` sin `Validators`, foto marcada `*` en `reporte-form.html:58` pero `onSubmit:152-160` no la exige.

**Arreglo paso a paso:**
1. Cambia navigates a `['/estudiante/mis-reportes']` y `['/estudiante/inicio']` (verifícalo en tu `app.routes.ts`).
2. Añade `{withCredentials:true}` en `obtenerEstudiantePorId`.
3. En `reporte-form.ts:65-70` añade `Validators.maxLength(100)` y `if(!this.fotoFile && !editando) {error='Foto obligatoria'; return;}`. En trabajador añade `Validators.required` a título/descripción o deshabilita botón si inválido.
4. Login `login-form.component.ts:31-34`: añade `minLength(4)` + `trim()` antes de enviar, no necesitas más.

## 13. [P1][Front] URLs hardcodeadas + sin interceptor + doble `/me`

**Qué es:**
1. `auth.service.ts:17`, `reporte-form.ts:248`, `inicio-list.html:53` hardcodean `http://localhost:3000`. En despliegue se rompe.
2. `withCredentials` copiado a mano en cada servicio, sin manejo 401 global.
3. `AuthGuard+RoleGuard` hacen 2x `GET /api/auth/me` por navegación.

**Arreglo paso a paso:**
1. Usa `environment.ts` en todos: `import {environment} from '../environments/environment'; private API = environment.apiUrl+'/auth';` Crea `environment.prod.ts` con URL de despliegue + `fileReplacements` en `angular.json`.
2. Crea `auth.interceptor.ts` con `withInterceptors`: añade `withCredentials:true` + `catchError 401 -> router.navigate(['/login'])`. Regístralo en `app.config.ts` con `provideHttpClient(withInterceptors([authInterceptor]))`.
3. Fusiona guards o cachea `me()` 30s en `auth.service` con `shareReplay(1)`.

## 14. [P1][BD] Modelo: `estudiante` como API + tipos + índices (suficiente para 7k)

**Qué es paso a paso:**
1. README dice `estudiante` es API externa sin FK. A medias: hoy está en el mismo `CREATE DATABASE` con PII+hashes, y cada `JOIN` en `reporteController.js:231,264,297` la usa. Si borras un alumno, sus reportes desaparecen por `INNER JOIN`.
2. Tipos: `titulo varchar(30)` corta títulos reales, `foto_url varchar(100)` justo, `utf8mb3` obsoleto, `DB reporte_incidencia` singular vs `DB_NAME=reporte_incidencias` plural, tabla `sessions` no está en `.sql`.
3. Sin índices en `reporte(id_estado,id_estudiante)`, `reaccion(id_reporte)`. `connectionLimit:10` está bien para 7k, no tocar.

**Arreglo paso a paso:**
1. Decide y documenta 1 línea en README: "estudiante es solo-lectura, prohibido DELETE/UPDATE, sin FK intencional". No borres alumnos, usa `activo=0`.
2. Ejecuta:
   ```sql
   ALTER TABLE reporte MODIFY titulo VARCHAR(100);
   ALTER TABLE reporte MODIFY foto_url VARCHAR(255);
   ALTER TABLE reporte ADD INDEX idx_rep_estado (id_estado);
   ALTER TABLE reporte ADD INDEX idx_rep_est (id_estudiante);
   ALTER TABLE reaccion ADD INDEX idx_reacc_rep (id_reporte);
   ```
3. Añade `sessions` al `.sql` o deja `createDatabaseTable:true` pero avísalo en sustentación.
4. Cambia DB a `utf8mb4` en próxima reinstall, no migres en vivo para curso.
5. `cantidad_reacciones`: con `UNIQUE(12)` + transacción actual basta. No pongas trigger/vista para este tamaño.

## 15. [P1][Seg/Docs] PII en dump + qué NO hacer

**Qué es:** `database/bd_reporte_incidencias.sql` trae nombres/DNI/teléfonos/correos + 5 hashes `$2b$10$`. Cualquiera hace cracking offline.

**Arreglo paso a paso:**
1. Anonimiza dump de entrega: `nombres=Alumno1...`, `dni=00000001`, `correo=alumno1@unu.edu.pe`, `clave` = hash de `123456` solo para demo. Guarda el real solo local.
2. Qué NO hacer para este tamaño (para que no te pidan overkill en sustentación): Docker/K8s, CI/CD, microservicio separado, Redis, WAF, CSP custom, `winston/prometheus`, S3. Basta `mysqldump` semanal + copiar `C:/Reportes_UNU_IMG/uploads` a disco externo.

---

### Orden para arreglar en 1 tarde (para sustentar)
1. Rotar secretos + `.gitignore` raíz (15 min) - n°7
2. `npm update` + `npm audit` (15 min) - n°8
3. `UNIQUE` + `LIMIT` (30 min) - n°5,6
4. IDOR con sesión (1h) - n°1,2
5. Validación + manejador Multer (45 min) - n°3,4
6. Front rutas + `withCredentials` + interceptor (45 min) - n°12,13
