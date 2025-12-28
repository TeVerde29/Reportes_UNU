const bcrypt = require('bcrypt');
(async () => {
  const plain = process.argv[2] ?? '4889'; // ejemplo
  const hash = await bcrypt.hash(plain, 10);
  console.log(hash);
})();


// node hash.js