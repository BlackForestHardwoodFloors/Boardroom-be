const bcrypt = require('bcryptjs');
const password = 'password123';
bcrypt.hash(password, 10, (err, hash) => {
  console.log('Hashed password:', hash);
});
