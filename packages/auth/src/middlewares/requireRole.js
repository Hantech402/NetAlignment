import Boom from 'boom';

export const requireAdmin = (req, res, next) => {
  const role = req.user.role;
  if (role !== 'admin' && role !== 'admin') throw Boom.unauthorized('You have not enough permissions');
  next();
};

export const requireBorrower = (req, res, next) => {
  const role = req.user.role;
  if (role !== 'admin' && role !== 'borrower') throw Boom.unauthorized('You have not enough permissions');
  next();
};

export const requireLender = (req, res, next) => {
  const role = req.user.role;
  if (role !== 'admin' && role !== 'lender') throw Boom.unauthorized('You have not enough permissions');
  next();
};
