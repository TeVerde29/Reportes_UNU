// ============================================================
// FOTOS: disco local o nube (Cloudinary), según entorno
// Guía: una sola puerta para todo lo de fotos.
//  - En tu PC (sin CLOUDINARY_URL): guarda en UPLOAD_DIR y devuelve
//    `/uploads/reportes/xxx.jpg` (lo sirve server.js).
//  - En despliegue (con CLOUDINARY_URL): sube a la nube y devuelve
//    la URL https. El resto del código no cambia.
// Interfaz: upload (multer), guardarFoto, borrarFoto, esNube.
// ============================================================
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'Reportes_UNU_IMG', 'uploads', 'reportes');
const CARPETA_NUBE = process.env.CLOUDINARY_FOLDER || 'reportes_unu';

function esNube() {
  return !!process.env.CLOUDINARY_URL;
}

let cloudinary = null;
if (esNube()) {
  cloudinary = require('cloudinary').v2;
}

function nombreSeguro(ext) {
  return crypto.randomBytes(16).toString('hex') + ext;
}

// Multer siempre en memoria: el destino final lo decide guardarFoto()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedExtensions.includes(ext) || !allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Solo se permiten imágenes (JPG, JPEG, PNG, WEBP)'));
    }
    cb(null, true);
  }
});

function subirNube(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: CARPETA_NUBE, public_id: publicId, overwrite: true, resource_type: 'image' },
      (err, res) => (err ? reject(err) : resolve(res.secure_url))
    );
    stream.end(buffer);
  });
}

// Guarda la foto y devuelve la URL a guardar en BD
async function guardarFoto(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (esNube()) {
    const publicId = path.basename(nombreSeguro(''), '.');
    return subirNube(file.buffer, publicId);
  }
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  const nombreFinal = nombreSeguro(ext === '.jpeg' ? '.jpg' : ext);
  fs.writeFileSync(path.join(UPLOAD_DIR, nombreFinal), file.buffer);
  return `/uploads/reportes/${nombreFinal}`;
}

// Reemplaza la foto manteniendo la misma URL (para editar sin romper links)
async function reemplazarFoto(file, fotoUrlActual) {
  if (esNube()) {
    const publicId = publicIdDeUrl(fotoUrlActual) || path.basename(nombreSeguro(''), '.');
    return subirNube(file.buffer, publicId);
  }
  const filenameActual = path.basename(fotoUrlActual);
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  fs.writeFileSync(path.join(UPLOAD_DIR, filenameActual), file.buffer);
  return fotoUrlActual;
}

function publicIdDeUrl(fotoUrl) {
  if (!fotoUrl || !fotoUrl.includes('res.cloudinary.com')) return null;
  const sinExtension = fotoUrl.substring(0, fotoUrl.lastIndexOf('.'));
  const partes = sinExtension.split('/');
  const idx = partes.indexOf(CARPETA_NUBE);
  const rel = idx >= 0 ? partes.slice(idx).join('/') : partes.slice(-1)[0];
  return rel;
}

// Borra la foto donde viva (nube o disco)
async function borrarFoto(fotoUrl) {
  if (!fotoUrl) return;
  try {
    if (fotoUrl.includes('res.cloudinary.com') && cloudinary) {
      const publicId = publicIdDeUrl(fotoUrl);
      if (publicId) await cloudinary.uploader.destroy(publicId);
      return;
    }
    const fotoPath = path.join(UPLOAD_DIR, path.basename(fotoUrl));
    if (fs.existsSync(fotoPath)) fs.unlinkSync(fotoPath);
  } catch (e) {
    console.error('Error al eliminar foto:', e.message);
  }
}

module.exports = { upload, guardarFoto, reemplazarFoto, borrarFoto, esNube, UPLOAD_DIR };
