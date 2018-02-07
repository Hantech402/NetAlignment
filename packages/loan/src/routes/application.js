import { Router } from 'express';
import { ObjectID as objectId } from 'mongodb';
import Boom from 'boom';

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

  router.patch(
    '/:id',
    async (req, res, next) => {
      try {
        const _id = objectId(req.params.id);
        const loanApp = await LoanApplicationRepository.findOne({ query: { _id } });
        if (!loanApp) throw Boom.notFound('Loan app not found. Probably wrong id');
        if (loanApp.accountId.toString() !== req.user.accountId) throw Boom.forbidden('It is not your loan app');

        await LoanApplicationRepository.updateOne({
          query: { _id },
          update: { $set: req.body },
        });

        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.delete(
    '/:id',
    async (req, res, next) => {
      try {
        const _id = objectId(req.params.id);
        const loanApp = await LoanApplicationRepository.findOne({ query: { _id } });
        if (!loanApp) throw Boom.notFound('Loan app not found. Probably wrong id');
        if (loanApp.accountId.toString() !== req.user.accountId) throw Boom.forbidden('It is not your loan app');

        await LoanApplicationRepository.deleteOne({ query: { _id } });
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
};
