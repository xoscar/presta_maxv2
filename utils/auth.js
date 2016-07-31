const User = require('../models/User');

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

function middleware(req, res, next) {
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
  authUser,
  middleware,
};
