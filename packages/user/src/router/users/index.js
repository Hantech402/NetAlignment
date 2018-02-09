import { Router } from 'express';

import { commonUserRouter } from './usersRouter';
import { adminRouter } from './adminRouter';

export const usersRouter = indexRouterConfig => {
  const {
    UserRepository,
    AccountRepository,
    config,
    permissions,
    router = Router(),
  } = indexRouterConfig;

  // user (common) router
  router.use(commonUserRouter({ UserRepository, AccountRepository, config, permissions }));
  // admin router
  router.use(adminRouter({ UserRepository, AccountRepository, config, permissions }));

  return router;
};
