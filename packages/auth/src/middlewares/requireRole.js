import Boom from 'boom';

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') throw Boom.unauthorized('You have not enough permissions');
  next();
};

export const requireBorrower = (req, res, next) => {
  if (req.user.role !== 'borrower') throw Boom.unauthorized('You have not enough permissions');
  next();
};

export const requireLender = (req, res, next) => {
  if (req.user.role !== 'lender') throw Boom.unauthorized('You have not enough permissions');
  next();
};

export const requireBroker = (req, res, next) => {
  if (req.user.role !== 'broker') throw Boom.unauthorized('You have not enough permissions');
  next();
};
