# Reportes_UNU — Sistema de Reporte de Incidencias

Aplicación web para reportar incidencias dentro de la UNU (infraestructura, mobiliario,
equipos electrónicos, instalaciones eléctricas y sanitarias, áreas verdes, seguridad y limpieza).

Los estudiantes crean reportes con foto, les dan like a los reportes aceptados y hacen
seguimiento a los suyos. El personal revisa los reportes pendientes y cambia su estado a
aceptado, resuelto o rechazado, además de consultar estadísticas por tipo de problema,
ubicación y mes.

## Stack

- **Backend:** Node.js + Express 5 + `mysql2` + `express-session` (autenticación por sesión, cookie `sid`)
- **Frontend:** Angular 19 + Angular Material + `ng2-charts` / Chart.js
- **BD:** MySQL — script en `database/bd_reporte_incidencias.sql`
- Probado con Node v22 + npm 10.

## Estructura

```
Reportes_UNU/
├── backend/        # API Express (http://localhost:3000)
├── frontend/       # App Angular (http://localhost:4200)
├── database/       # Script SQL de la base de datos
├── documentation/  # Informes del proyecto
└── README.md
```

Las fotos de los reportes se guardan en el disco local del PC
(`C:/Reportes_UNU_IMG/uploads/reportes`, se crea automáticamente); en la BD solo se
guarda la ruta en `reporte.foto_url`.

## Puesta en marcha

### 1. Base de datos

Ejecuta en MySQL el script canónico:

```
database/bd_reporte_incidencias.sql
```

### 2. Backend

```bash
cd backend
npm install
```

Crea el archivo `backend/.env` (local, no se commitea) con este contenido:

```env
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=reporte_incidencias

BCRYPT_ROUNDS=10

SESSION_SECRET=una_clave_larga_y_secreta
FRONTEND_ORIGIN=http://localhost:4200

UPLOAD_DIR=C:/Reportes_UNU_IMG/uploads/reportes
```

Luego levanta el servidor:

```bash
node server.js
```

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

## Notas del proyecto

- La tabla `estudiante` simula la **API de alumnos de la UNU**: por eso no tiene claves
  foráneas hacia las demás tablas; debe tratarse como un servicio externo.
- Proyecto académico: el guardado de imágenes en el PC local y la estructura de carpeta
  única (código + BD + documentación) responden a los requisitos de entrega de la UNU.
