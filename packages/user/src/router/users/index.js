import { Router } from 'express';

import { commonUserRouter } from './usersRouter';
import { adminRouter } from './adminRouter';

export const usersRouter = indexRouterConfig => {
  const {
    UserRepository,
    AccountRepository,
    config,
    permissions,
    LoanApplicationRepository,
    router = Router(),
  } = indexRouterConfig;

  // user (common) router
  router.use(commonUserRouter({
    UserRepository, AccountRepository, config, permissions, LoanApplicationRepository,
  }));
  // admin router
  router.use(adminRouter({ UserRepository, AccountRepository, config, permissions }));

  return router;
};
