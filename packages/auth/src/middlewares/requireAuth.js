import jwt from 'jsonwebtoken';
import bluebird from 'bluebird';
import Boom from 'boom';

const verify = bluebird.promisify(jwt.verify);

export const decodeAndVerifyToken = ({ jwtSecret }) =>
  async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const decoded = await verify(token, jwtSecret);

      req.user = decoded;
    } catch (err) {
      if (err.name === 'TokenExpiredError') return next(Boom.unauthorized('Token has expired'));
      next(err);
    }
  };

export const requireAuth = ({ jwtSecret }) =>
  async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) return next(Boom.unauthorized('Token must be provided'));
      const decoded = await verify(token, jwtSecret);

      // const havePermission = await permissionsManager.can(decoded, 'isAdmin');
      // if (!havePermission) throw Boom.unauthorized('You do not have enough permissions');
      req.user = decoded;
      next();
    } catch (err) {
      if (err.message === 'invalid signature') return next(Boom.unauthorized('Invalid token signature'));
      if (err.name === 'TokenExpiredError') return next(Boom.unauthorized('Token has expired'));
      next(err);
    }
  };
