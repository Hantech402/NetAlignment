import { Router } from 'express';

import { commonUserRouter } from './usersRouter';
import { adminRouter } from './adminRouter';

export const usersRouter = indexRouterConfig => {
  const {
    UserRepository,
    AccountRepository,
    config,
    router = Router(),
  } = indexRouterConfig;

  // user (common) router
  router.use(commonUserRouter({ UserRepository, AccountRepository, config }));
  // admin router
  router.use(adminRouter({ UserRepository, AccountRepository, config }));

  return router;
};
