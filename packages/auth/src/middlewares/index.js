import { requireAdmin } from './requrieAdmin';
import { requireAuth, decodeAndVerifyToken } from './requireAuth';

export const setupMiddleware = ({ UserRepository, jwtSecret, permissionsManager }) => {
  // permissionsManager.define('admin');
  return {
    requireAdmin: requireAdmin({ UserRepository, jwtSecret, permissionsManager }),
    requireAuth: requireAuth({ UserRepository, jwtSecret, permissionsManager }),
    decodeAndVerifyToken: decodeAndVerifyToken({ jwtSecret }),
  };
};
