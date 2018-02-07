import Boom from 'boom';

export const requireAdmin = (req, res, next) => {
  if (req.user.scope !== 'admin') throw Boom.unauthorized('You have not enough permissions');
  next();
};

export const requireBorrower = (req, res, next) => {
  if (req.user.scope !== 'borrower') throw Boom.unauthorized('You have not enough permissions');
  next();
};

export const requireLender = (req, res, next) => {
  if (req.user.scope !== 'lender') throw Boom.unauthorized('You have not enough permissions');
  next();
};

export const requireBroker = (req, res, next) => {
  if (req.user.scope !== 'broker') throw Boom.unauthorized('You have not enough permissions');
  next();
};
