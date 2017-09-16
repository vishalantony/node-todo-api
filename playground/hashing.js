const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');
//

const bcrypt = require('bcryptjs');

var password = '123abc!';

bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(password, salt, (err, hash) => {
    console.log(hash);
  });
});


var hashedPassword = '$2a$10$nPp4HQ0t7uhx8j/rQcOx3uJf.4mQa38pNFBHep22A6R.Dqb0WvGjy';
bcrypt.compare(password, hashedPassword, (err, result) => {
  console.log(result);
});
// var data = {
//   id: 10
// };
//
//
// var token = jwt.sign(data, '123abc');
//
// console.log(token);
//
// var decoded = jwt.verify(token, '123abec');
// console.log('Decoded ', decoded);

// jwt.sign
// jwt.verify

// var message = 'I am user number 3'
// var hash = SHA256(message).toString();
// console.log(`Message: ${message}\nHash: ${hash}`);
//
// var data = {
//   id: 4
// };
//
// var token = {
//   data,
//   hash: SHA256(JSON.stringify(data)).toString()
// }
