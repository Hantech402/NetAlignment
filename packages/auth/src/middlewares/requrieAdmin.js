import jwt from 'jsonwebtoken';
import bluebird from 'bluebird';
import Boom from 'boom';

const verify = bluebird.promisify(jwt.verify);

export const requireAdmin = ({ UserRepository, jwtSecret, permissionsManager }) =>
  async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const decoded = await verify(token, jwtSecret);
      if (decoded.scope !== 'admin') throw Boom.unauthorized('You have not enough permissions');

      req.user = decoded;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') throw Boom.unauthorized('Token has expired');
      next(err);
    }
  };

