import jwt from 'jsonwebtoken';
import bluebird from 'bluebird';
import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';

const verify = bluebird.promisify(jwt.verify);

export const decodeAndVerifyToken = ({ jwtSecret }) =>
  async (req, res, next) => {
    try {
      const { AccountRepository } = req.app.modules.get('net-alignments.users');
      const token = req.headers.authorization;
      if (!token) return;
      const decoded = await verify(token, jwtSecret);

      const _id = objectId(decoded.accountId);
      const account = await AccountRepository.findOne({ query: { _id } });
      if (!account.isActive) return next(Boom.unauthorized('Your account is disabled'));

      req.user = decoded;
    } catch (err) {
      if (err.name === 'TokenExpiredError') return next(Boom.unauthorized('Token has expired'));
      next(err);
    }
  };

export const requireAuth = ({ jwtSecret }) =>
  async (req, res, next) => {
    try {
      const { AccountRepository } = req.app.modules.get('net-alignments.users');
      const token = req.headers.authorization;
      if (!token) return next(Boom.unauthorized('Token must be provided'));
      const decoded = await verify(token, jwtSecret);

      const _id = objectId(decoded.accountId);
      const account = await AccountRepository.findOne({ query: { _id } });
      if (account.isDeleted || account.isDeactivated || !account.isActive) next(Boom.unauthorized('Your account is disabled'));

      req.user = decoded;
      req.user.isConfirmed = account.isConfirmed;
      next();
    } catch (err) {
      if (err.message === 'invalid signature') return next(Boom.unauthorized('Invalid token signature'));
      if (err.name === 'TokenExpiredError') return next(Boom.unauthorized('Token has expired'));
      next(err);
    }
  };
