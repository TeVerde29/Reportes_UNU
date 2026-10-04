// ============================================================
// JOB: borra pendientes con más de 7 días (observaciones punto 2)
// Guía: lo llama server.js una vez al día. Borra fila + foto
// (en disco o nube según entorno). Las reacciones se van solas
// (FK ON DELETE CASCADE).
// ============================================================
const db = require('../config/database');
const { borrarFoto } = require('../config/storage');

async function limpiarPendientesAntiguos() {
  const [viejos] = await db.query(`
    SELECT id_reporte, foto_url
    FROM reporte
    WHERE id_estado = 1 AND fecha_reporte < DATE_SUB(NOW(), INTERVAL 7 DAY)
  `);
  let fotos = 0;
  for (const r of viejos) {
    if (!r.foto_url) continue;
    await borrarFoto(r.foto_url);
    fotos++;
  }
  if (viejos.length > 0) {
    await db.query(`
      DELETE FROM reporte
      WHERE id_estado = 1 AND fecha_reporte < DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
  }
  return { reportes: viejos.length, fotos };
}

module.exports = { limpiarPendientesAntiguos };
