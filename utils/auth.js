const User = require('../models/User');

const authUser = (username, token, callback) => {
  User.findOne({
    username,
  }, (err, user) => {
    if (err || !user) {
      return callback(false);
    }

    return user.compareToken(token, (compareErr, isMatch) => {
      if (compareErr || !isMatch) {
        return callback(false);
      }

      return callback(true, user);
    });
  });
};

const middleware = (req, res, next) => {
  const username = req.headers.user;
  const token = req.headers.token;

  if (!username || !token) {
    return res.status(401).send('No credentials given.');
  }

  return authUser(username, token, (isAuthed, user) => {
    if (!isAuthed) {
      return res.status(401).send('Invalid credentials.');
    }

    req.user = user;
    return next();
  });
};

module.exports = {
  authUser,
  middleware,
};
