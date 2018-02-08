import { Router } from 'express';

import { applicationRouter } from './application';

export const loanRouter = loanRouterConfig => {
  const {
    permissions,
    FileManagerService,
    LoanApplicationRepository,
    router = Router(),
  } = loanRouterConfig;

  router.use('/applications', applicationRouter({ permissions, FileManagerService, LoanApplicationRepository }));

  return router;
};
