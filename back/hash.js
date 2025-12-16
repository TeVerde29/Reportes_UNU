const bcrypt = require('bcrypt');

(async () => {
  const plain = '1234'; // <-- Coloca lo que quiere hashear
  const hash = await bcrypt.hash(plain, 10);
  console.log(hash);
})();

// node tokenGenerator.js