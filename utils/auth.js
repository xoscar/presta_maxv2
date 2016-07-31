const User = require('../models/user');

function authUser(user, token, callback) {
  User.findOne({
    username: user,
  }, (err, user) => {
    if (err || !user) return callback(false);
    else {
      user.compareToken(token, function (err, isMatch) {
        if (err || !isMatch) return callback(false);
        else return callback(true, user);
      });
    }
  });
}

function authMiddleware(req, res, next) {
  var user = req.headers.user;
  var token = req.headers.token;

  if (!user || !token) return res.status(401).send('No credentials given.');
  else {
    authUser(user, token, (isAuthed, user) => {
      if (!isAuthed) return res.status(401).send('Invalid credentials.');

      req.user = user;
      next();
    });
  }

}

////////////
// Export //
////////////

module.exports = {
  authUser: authUser,
  auth: authMiddleware,
};