import { Router } from 'express';
import { ObjectID as objectId } from 'mongodb';
import Boom from 'boom';
import Celebrate from 'celebrate';
import Joi from 'joi';
import omit from 'lodash/omit';

import loanAppScheme from '../schemas/loanApplication';

export const applicationRouter = config => {
  const {
    router = Router(),
    permissions,
    LoanApplicationRepository,
    FileManagerService,
    LoanEstimateRepository,
  } = config;

  router.use(permissions.requireAuth, permissions.requireBorrower);

  router.post(
    /**
    * Create loan application
    * @route POST /loans/applications/
    * @group LoanApp
    * @returns {object} 200 - loan object
    * @security jwtToken
    */

    '/',
    Celebrate({ body: omit(loanAppScheme, ['accountId', 'status']) }),
    async (req, res, next) => {
      try {
        if (req.body.fileIds) req.body.fileIds = req.body.fileIds.map(fileId => objectId(fileId));
        if (!req.user.isConfirmed) req.body.status = 'draft';

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
    /**
    * Find all user's loan apps
    * @route GET /loans/applications
    * @group LoanApp
    * @returns {object} 200 - loan obj
    * @security jwtToken
    */

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
    /**
    * Update loan application
    * @route PATCH /loans/applications/:id
    * @group LoanApp
    * @param {string} id.path.required
    * @security jwtToken
    */

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
    /**
     * Delete loan application
     * @route DELETE /loans/application/deleteOne
     * @group LoanApp
     * @param {string} query.query.required
     * @security jwtToken
    */

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
    /**
     * Delete loan application by id
     * @route DELETE /loans/applications/{id}/
     * @group LoanApp
     * @param {string} id.path.required
     * @security jwtToken
    */

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
    /**
     * Count all user's loan applications
     * @route GET /loans/applications/count
     * @group LoanApp
     * @returns {number} 200
     * @security jwtToken
    */

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
    /**
     * Find user's loan application
     * @route GET /loans/applications/findOne
     * @group LoanApp
     * @param {object} object.query.required - mongo query object
     * @returns {object} 200
     * @security jwtToken
    */

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
    /**
    * Find loan app by id
    * @route GET /loans/applications/{id}
    * @group LoanApp
    * @param {string} id.path.required
    * @returns {object} 200 - loan object
    * @security jwtToken
    */

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
    /**
     * Get loan's app files objects by loan app id
     * @route GET /loans/applications/{id}/files
     * @group LoanApp
     * @param {string} id.path.required
     * @returns {array} 200 - array of files objects
     * @security jwtToken
    */

    '/:id/files',
    async (req, res, next) => {
      try {
        const _id = objectId(req.params.id);
        const loanApp = await LoanApplicationRepository.findOne({
          query: { _id },
          options: { fields: { fileIds: 1, accountId: 1 } },
        });
        if (!loanApp) throw Boom.notFound('Unable to find loan application');
        if (loanApp.accountId.toString() !== req.user.accountId) throw Boom.forbidden('Missing permissions');

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

  router.get(
    /**
    * Download files by loan id
    * @route GET /loans/applications/{id}/files/archive
    * @group LoanApp
    * @param {string} id.path.required
    * @returns {file} 200 - zip file
    * @security jwtToken
    */

    '/:id/files/archive',
    async (req, res, next) => {
      try {
        const _id = objectId(req.params.id);
        const loanApp = await LoanApplicationRepository.findOne({
          query: { _id },
          options: { fields: { fileIds: 1, accountId: 1 } },
        });
        if (!loanApp) throw Boom.notFound('Unable to find loan application');
        if (loanApp.accountId.toString() !== req.user.accountId) throw Boom.forbidden('Missing permissions');

        const files = await FileManagerService.findMany({
          query: {
            _id: {
              $in: loanApp.fileIds,
            },
          },
        }).toArray();

        if (!files.length) throw Boom.notFound('Unable to find any file for this loan application');

        const filesPath = files.map(file => file.filename);
        FileManagerService.archiveFiles({ filesPath, res });
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    /**
    * Get loan estimates for auction id
    * @route GET /loans/applications/estimates/:id
    * @group LoanApp
    * @param {string} id.path.required - id of loan application
    * @returns {array} 200 - loanEstimates array
    * @security jwtToken
    */

    '/estimates/:id',
    async (req, res, next) => {
      try {
        const accountId = objectId(req.user.accountId);
        const loanApplicationId = objectId(req.params.id);

        const loanApp = await LoanApplicationRepository.findOne({
          query: { _id: loanApplicationId, accountId },
        });
        if (!loanApp) throw Boom.notFound('Unable to find loan app with such id');

        const loanEstimates = await LoanEstimateRepository.findMany({
          query: { loanApplicationId },
        }).toArray();
        if (!loanEstimates.length) throw Boom.notFound('Unable to find loan estimates for this auction');

        res.json({ loanEstimates });
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
};
