const bcrypt = require('bcrypt');

(async () => {
  const plain = '1234';
  const hash = await bcrypt.hash(plain, 10);
  console.log(hash);
})();
