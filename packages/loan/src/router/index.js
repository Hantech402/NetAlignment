import { Router } from 'express';

import { applicationRouter } from './application';
import { estimateRouter } from './estimates';

export const loanRouter = config => {
  const {
    EstimateRepository,
    LoanApplicationRepository,
    permissions,
    FileManagerService,
  } = config;

  const router = Router();

  router.use('/applications', applicationRouter({
    LoanApplicationRepository,
    permissions,
    FileManagerService,
  }));

  router.use('/estimates', estimateRouter({
    LoanApplicationRepository,
    permissions,
    FileManagerService,
    EstimateRepository,
  }));

  return router;
};

