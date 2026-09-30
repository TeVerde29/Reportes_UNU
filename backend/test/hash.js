const bcrypt = require('bcrypt');

(async () => {
  try {
    const plain = process.argv[2] ?? '0376';
    const saltRounds = 10;
    
    const hash = await bcrypt.hash(plain, saltRounds);
    
    console.log(`Texto original: ${plain}`);
    console.log(`Hash generado:  ${hash}`);
  } catch (error) {
    console.error("Error al generar el hash:", error.message);
  }
})();


// node hash.js