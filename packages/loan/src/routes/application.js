import { Router } from 'express';
import { ObjectID as objectId } from 'mongodb';
import Boom from 'boom';
import Celebrate from 'celebrate';
import Joi from 'joi';

export const applicationRouter = config => {
  const {
    router = Router(),
    permissions,
    LoanApplicationRepository,
    FileManagerService,
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
        const accountId = objectId(req.user.accountId);
        const loanApp = await LoanApplicationRepository.findOne({ query: { _id, accountId } });
        if (!loanApp) throw Boom.notFound('Loan app not found. Probably wrong id');

        await LoanApplicationRepository.updateOne({
          query: { _id, accountId },
          update: { $set: req.body },
        });

        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.delete(
    '/deleteOne',
    Celebrate({ body: Joi.object().keys({
      query: Joi.object().required(),
    }).required() }),
    async (req, res, next) => {
      try {
        const accountId = objectId(req.user.accountId);
        const query = { ...req.body.query, accountId };
        const loanAppExist = await LoanApplicationRepository.count({ query });
        if (!loanAppExist) throw Boom.notFound('Unable to find loan application');

        await LoanApplicationRepository.deleteOne({ query });
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
        const accountId = objectId(req.user.accountId);
        const loanApp = await LoanApplicationRepository.findOne({ query: { _id, accountId } });
        if (!loanApp) throw Boom.notFound('Loan app not found. Probably wrong id');

        await LoanApplicationRepository.deleteOne({ query: { _id, accountId } });
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    '/count',
    async (req, res, next) => {
      try {
        const accountId = objectId(req.user.accountId);
        const loanAppsCount = await LoanApplicationRepository.count({ query: { accountId } });
        res.json(loanAppsCount);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    '/findOne',
    Celebrate({ query: Joi.object().keys({
      query: Joi.object().required(),
    }).required() }),
    async (req, res, next) => {
      try {
        const query = req.query.query;
        const loan = await LoanApplicationRepository.findOne({ query });
        if (!loan) throw Boom.notFound('Unable to find loan application');

        res.json(loan);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    '/:id',
    async (req, res, next) => {
      try {
        const _id = objectId(req.params.id);
        const accountId = objectId(req.user.accountId);
        const loanApp = await LoanApplicationRepository.findOne({ query: { _id, accountId } });

        if (!loanApp) throw Boom.notFound(`Cannot found loan application with id ${req.params.id}`);
        res.json(loanApp);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    '/:id/files',
    async (req, res, next) => {
      try {
        const _id = objectId(req.params.id);
        const loanApp = await LoanApplicationRepository.findOne({
          query: { _id },
          options: { fields: { fileIds: 1 } },
        });
        if (!loanApp) throw Boom.notFound('Unable to find loan application');

        const files = await FileManagerService.findMany({
          query: {
            _id: {
              $in: loanApp.fileIds,
            },
          },
        }).toArray();

        res.json(files);
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
};
