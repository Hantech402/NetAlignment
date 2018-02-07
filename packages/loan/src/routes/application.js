import { Router } from 'express';
import { ObjectID as objectId } from 'mongodb';

export const applicationRouter = config => {
  const {
    router = Router(),
    permissions,
    LoanApplicationRepository,
  } = config;

  router.use(permissions.requireAuth);

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

  return router;
};
