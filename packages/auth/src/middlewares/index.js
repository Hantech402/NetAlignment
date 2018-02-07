// import { requireAdmin } from './requrieAdmin';
import { requireAuth, decodeAndVerifyToken } from './requireAuth';
import { requireAdmin, requireBroker, requireLender, requireBorrower } from './requireRole';

export const setupMiddleware = ({ UserRepository, jwtSecret, permissionsManager }) => ({
  requireAuth: requireAuth({ UserRepository, jwtSecret, permissionsManager }),
  requireAdmin,
  requireBroker,
  requireLender,
  requireBorrower,
  decodeAndVerifyToken: decodeAndVerifyToken({ jwtSecret }),
});
