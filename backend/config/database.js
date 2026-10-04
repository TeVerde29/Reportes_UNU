// ============================================================
// CONEXIÓN A MYSQL (local o nube como TiDB)
// Guía: este pozo (pool) presta conexiones a los controladores.
// - connectionLimit: 10 alcanza para 7000 alumnos (no entran todos juntos)
// - Todas las consultas usan `?` para evitar inyección SQL.
// - En nube (TiDB): pon DB_SSL=true (exige conexión cifrada).
// ============================================================
const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: true } } : {})
});

const promisePool = pool.promise();

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error en la conexion');
    } else {
        console.log('Conexion exitosa');
        connection.release();
    }
});

module.exports = promisePool;
