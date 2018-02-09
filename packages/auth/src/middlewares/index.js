// import { requireAdmin } from './requrieAdmin';
import { requireAuth, decodeAndVerifyToken } from './requireAuth';
import { requireAdmin, requireBroker, requireLender, requireBorrower } from './requireRole';

export const setupMiddleware = ({ jwtSecret }) => ({
  requireAuth: requireAuth({ jwtSecret }),
  requireAdmin,
  requireBroker,
  requireLender,
  requireBorrower,
  decodeAndVerifyToken: decodeAndVerifyToken({ jwtSecret }),
});
