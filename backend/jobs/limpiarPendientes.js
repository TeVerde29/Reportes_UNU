// ============================================================
// JOB: borra pendientes con más de 7 días (observaciones punto 2)
// Guía: lo llama server.js una vez al día. Borra fila + foto.
// Las reacciones se van solas (FK ON DELETE CASCADE).
// ============================================================
const path = require('path');
const fs = require('fs');
const db = require('../config/database');

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'Reportes_UNU_IMG', 'uploads', 'reportes');

async function limpiarPendientesAntiguos() {
  const [viejos] = await db.query(`
    SELECT id_reporte, foto_url
    FROM reporte
    WHERE id_estado = 1 AND fecha_reporte < DATE_SUB(NOW(), INTERVAL 7 DAY)
  `);
  let fotos = 0;
  for (const r of viejos) {
    if (!r.foto_url) continue;
    const fotoPath = path.join(UPLOAD_DIR, path.basename(r.foto_url));
    try {
      if (fs.existsSync(fotoPath)) {
        fs.unlinkSync(fotoPath);
        fotos++;
      }
    } catch (e) { console.error('[job pendientes] foto:', e.message); }
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
