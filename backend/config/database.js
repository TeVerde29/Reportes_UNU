// ============================================================
// CONEXIÓN A MYSQL
// Guía: este pozo (pool) presta conexiones a los controladores.
// - connectionLimit: 10 alcanza para 7000 alumnos (no entran todos juntos)
// - Todas las consultas usan `?` para evitar inyección SQL.
// ============================================================
const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
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
