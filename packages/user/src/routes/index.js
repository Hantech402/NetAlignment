import { Router } from 'express';

import { userRouter } from './usersRouter';
import { adminRouter } from './adminRouter';

export const indexRouter = indexRouterConfig => {
  const {
    UserRepository,
    AccountRepository,
    config,
    router = Router(),
  } = indexRouterConfig;

  // user (common) router
  router.use(userRouter({ UserRepository, AccountRepository, config }));
  router.use(adminRouter({ UserRepository, AccountRepository, config }));

  return router;
};
