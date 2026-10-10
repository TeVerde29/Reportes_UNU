// ============================================================
// FRENO POR CUENTA - Reportes UNU
// Guía: frena la fuerza bruta por `codigo` (no solo por IP, porque todo
// el campus puede salir por la misma IP y el límite por IP castigaría
// a inocentes). Vive en BD (`bloqueo_login`) para sobrevivir reinicios.
//  - 10 fallos seguidos -> cuenta bloqueada 15 minutos (429)
//  - Un éxito limpia el contador
//  - Cualquier fallo interno aquí NUNCA bloquea el login (fail-open
//    con log): mejor dejar pasar que tumbar el ingreso por un error
//    de la tabla auxiliar.
// ============================================================
const db = require('./database');

const MAX_INTENTOS = 10;
const BLOQUEO_MINUTOS = 15;
// Desde cuántos fallos se exige CAPTCHA (primera muralla, antes del bloqueo)
const INTENTOS_CAPTCHA = 3;

// Crea la tabla si falta (idempotente, se llama al arrancar el server)
async function initSeguridad() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS bloqueo_login (
        codigo varchar(20) NOT NULL,
        intentos int NOT NULL DEFAULT 0,
        bloqueado_hasta datetime NULL,
        PRIMARY KEY (codigo)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    // Limpia bloqueos vencidos de arranques anteriores
    await db.query(`DELETE FROM bloqueo_login WHERE bloqueado_hasta IS NOT NULL AND bloqueado_hasta <= NOW()`);
  } catch (e) {
    console.error('[seguridad:init]', e.message);
  }
}

// ¿esta cuenta está bloqueada ahora? (si venció, la libera sola)
async function estaBloqueada(codigo) {
  try {
    const [rows] = await db.query(
      `SELECT intentos, bloqueado_hasta FROM bloqueo_login WHERE codigo = ? LIMIT 1`,
      [codigo]
    );
    if (rows.length === 0) return false;
    const hasta = rows[0].bloqueado_hasta;
    if (hasta && new Date(hasta).getTime() > Date.now()) return true;
    if (hasta) {
      await db.query(
        `UPDATE bloqueo_login SET intentos = 0, bloqueado_hasta = NULL WHERE codigo = ?`,
        [codigo]
      );
    }
    return false;
  } catch (e) {
    console.error('[seguridad:check]', e.message);
    return false;
  }
}

// Suma un fallo; si llega al tope, fija el bloqueo. Devuelve si quedó bloqueada.
async function registrarFallo(codigo) {
  try {
    await db.query(
      `INSERT INTO bloqueo_login (codigo, intentos) VALUES (?, 1)
       ON DUPLICATE KEY UPDATE
         intentos = intentos + 1,
         bloqueado_hasta = IF(intentos + 1 >= ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), bloqueado_hasta)`,
      [codigo, MAX_INTENTOS, BLOQUEO_MINUTOS]
    );
    return await estaBloqueada(codigo);
  } catch (e) {
    console.error('[seguridad:fallo]', e.message);
    return false;
  }
}

// Login bueno: borra el contador de esa cuenta
async function limpiarIntentos(codigo) {
  try {
    await db.query(`DELETE FROM bloqueo_login WHERE codigo = ?`, [codigo]);
  } catch (e) {
    console.error('[seguridad:limpiar]', e.message);
  }
}

// Cuántos fallos seguidos lleva una cuenta (0 si no hay registro o falla la BD)
async function obtenerIntentos(codigo) {
  try {
    const [rows] = await db.query(
      `SELECT intentos FROM bloqueo_login WHERE codigo = ? LIMIT 1`,
      [codigo]
    );
    return rows.length > 0 ? Number(rows[0].intentos) || 0 : 0;
  } catch (e) {
    console.error('[seguridad:intentos]', e.message);
    return 0;
  }
}

// Valida un token de Cloudflare Turnstile contra su API.
// Sin secreto configurado devuelve false (fail-closed: no se salta).
async function verificarCaptcha(token, ip) {
  try {
    const secreto = process.env.CLOUDFLARE_TURNSTILE_SECRET;
    if (!secreto || !token) return false;
    const params = new URLSearchParams({
      secret: secreto,
      response: token
    });
    if (ip) params.append('remoteip', ip);
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const data = await r.json();
    return data && data.success === true;
  } catch (e) {
    console.error('[seguridad:captcha]', e.message);
    return false;
  }
}

module.exports = {
  initSeguridad,
  estaBloqueada,
  registrarFallo,
  limpiarIntentos,
  obtenerIntentos,
  verificarCaptcha,
  MAX_INTENTOS,
  BLOQUEO_MINUTOS,
  INTENTOS_CAPTCHA
};
