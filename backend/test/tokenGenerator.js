function generarCodigoSeguro(longitud = 32, ext = "jpg") {
  const U = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const L = "abcdefghijklmnopqrstuvwxyz";
  const D = "0123456789";

  const all = U + L + D;

  let codigo = "";
  for (let i = 0; i < longitud; i++) {
    codigo += all[Math.floor(Math.random() * all.length)];
  }

  const ruta = `/uploads/reportes/${codigo}.${ext}`;

  return { codigo, ruta };
}

const { codigo, ruta } = generarCodigoSeguro();
console.log("codigo:", codigo);
console.log("ruta:", ruta);

// node tokenGenerator.js
