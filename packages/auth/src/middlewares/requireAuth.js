import jwt from 'jsonwebtoken';
import bluebird from 'bluebird';
import Boom from 'boom';

const verify = bluebird.promisify(jwt.verify);

export const requireAuth = ({ jwtSecret, permissionsManager }) =>
  async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const decoded = await verify(token, jwtSecret);

      // const havePermission = await permissionsManager.can(decoded, 'isAdmin');
      // if (!havePermission) throw Boom.unauthorized('You do not have enough permissions');
      req.user = decoded;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') throw Boom.unauthorized('Token has expired');
      next(err);
    }
  };
