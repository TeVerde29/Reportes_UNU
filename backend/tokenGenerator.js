function generarCodigoSeguro() {
  const U = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";  // Mayúsculas
  const L = "abcdefghijklmnopqrstuvwxyz";  // Minúsculas
  const D = "0123456789";  // Números
  const S = "-_";  // Caracteres especiales

  const all = U + L + D + S;  // Todos los posibles caracteres

  let codigo = '';
  
  for (let i = 0; i < 16; i++) { // <- Tamaño que quieras poner
    codigo += all.charAt(Math.floor(Math.random() * all.length));  // Escoge un carácter aleatorio
  }

  return codigo;
}

console.log(generarCodigoSeguro());

// node tokenGenerator.js