const bcrypt = require('bcrypt');
(async () => {
  const plain = process.argv[2] ?? '2222'; // ejemplo
  const hash = await bcrypt.hash(plain, 10);
  console.log(hash);
})();


// node hash.js