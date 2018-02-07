import { Router } from 'express';

import { applicationRouter } from './application';

export const loanRouter = loanRouterConfig => {
  const {
    permissions,
    LoanApplicationRepository,
    router = Router(),
  } = loanRouterConfig;

  router.use('/applications', applicationRouter({ permissions, LoanApplicationRepository }));

  return router;
};
