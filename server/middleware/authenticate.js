const { User } = require('../models/user.js');

var authenticate = (req, res, next) => {
  var token = req.header('x-auth'); // get header

  User.findByToken(token).then((user) => {
    if (!user) {
      return Promise.reject('Invalid user credentials');
    }
    req.user = user;
    req.token = token;
    next();
  }).catch((e) => {
    res.status(401).send({error: e});
  });
};

module.exports = {
  authenticate
};
