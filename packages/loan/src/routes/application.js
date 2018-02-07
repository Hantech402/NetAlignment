import { Router } from 'express';
import { ObjectID as objectId } from 'mongodb';

export const applicationRouter = config => {
  const {
    router = Router(),
    permissions,
    LoanApplicationRepository,
  } = config;

  router.use(permissions.requireAuth, permissions.requireBorrower);

  router.post(
    '/',
    async (req, res, next) => {
      try {
        const loanApp = await LoanApplicationRepository.createOne({
          ...req.body,
          accountId: objectId(req.user.accountId),
        });
        res.json(loanApp);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    '/',
    async (req, res, next) => {
      try {
        const accountId = objectId(req.user.accountId);
        const loanApps = await LoanApplicationRepository.findMany({
          query: { accountId },
        }).toArray();

        res.json(loanApps);
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
};
