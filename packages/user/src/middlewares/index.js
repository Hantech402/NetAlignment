import jwt from 'jsonwebtoken';
import Boom from 'boom';

export const requireAdmin = config => async (req, res, next) => { // eslint-disable-line 
  const token = req.headers.authorization;
  if (!token) return next(Boom.badRequest('You need authorization headers'));
  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) return next(Boom.unauthorized('Your token has expired'));
    if (decoded.scope !== 'admin') return next(Boom.forbidden('You do not have enough permissions'));
    req.user = decoded;
    return next();
  });
};

export const requireAuth = config => async (req, res, next) => { // eslint-disable-line
  const token = req.headers.authorization;
  if (!token) return next(Boom.badRequest('You need authorization headers'));
  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) return next(Boom.unauthorized('Your token has expired'));
    req.user = decoded;
    return next();
  });
};

