const authMiddleware = require('./auth');

const protectedRoutes = (req, res, next) => {
  return authMiddleware(req, res, next);
};

module.exports = { protectedRoutes };