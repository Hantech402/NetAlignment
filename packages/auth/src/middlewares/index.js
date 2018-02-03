import { requireAdmin } from './requrieAdmin';

export const setupMiddleware = ({ UserRepository, jwtSecret, permissionsManager }) => {
  // permissionsManager.define('admin');
  return {
    requireAdmin: requireAdmin({ UserRepository, jwtSecret, permissionsManager }),
  };
};
