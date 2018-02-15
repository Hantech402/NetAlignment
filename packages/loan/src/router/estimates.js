import { Router } from 'express';
import Celebrate from 'celebrate';
import Joi from 'joi';
import omit from 'lodash/omit';
// import pick from 'lodash/pick';
import { ObjectID as objectId } from 'mongodb';
import Boom from 'boom';

import loanEstimateSchema from '../schemas/loanEstimate';

export const estimateRouter = config => {
  const {
    LoanEstimateRepository,
    LoanApplicationRepository,
    permissions,
    // FileManagerService,
  } = config;

  const router = Router();

  router.use(permissions.requireAuth, permissions.requireLender);

  router.post(
    /**
     * Create new loan estimate by auction id
     * @route POST /loans/estimates
     * @group LoanApp
     * @param {string} loanApplicationId.body.required
     * @param {string} amortizationType.body.required
     * @param {number} interestRate.body.required
     * @param {number} nrOfMonths.body.required
     * @returns {object} 200 - new loanEstimate object
     * @security jwtToken
     */

    '/',
    Celebrate({ body: {
      ...omit(loanEstimateSchema, ['accountId']),
      loanApplicationId: Joi.string().required(),
    } }),
    async (req, res, next) => {
      try {
        const loanAppId = objectId(req.body.loanApplicationId);
        const loanApp = await LoanApplicationRepository.findOne({ query: { _id: loanAppId } });
        if (!loanApp) throw Boom.notFound('Unable to find auction with provided id');
        if (loanApp.status !== 'open') throw Boom.badRequest('LE could be created only for open auctions');

        const existLoanEstimate = await LoanEstimateRepository.findOne({
          query: { loanApplicationId: loanAppId },
        });
        if (existLoanEstimate) throw Boom.badRequest('You can create only one LE per one auction');

        const loanEstimate = await LoanEstimateRepository.createOne({
          ...req.body,
          loanApplicationId: loanAppId,
          accountId: objectId(req.user.accountId),
        });

        res.json({ loanEstimate });
      } catch (err) {
        next(err);
      }
    },
  );


  router.get(
    /**
     * Get all lender's loan estimates
     * @route GET /loans/estimates/
     * @group LoanApp
     * @returns {array} 200 - array of loan estimates with name loanEstimates
     * @security jwtToken
    */

    '/',
    async (req, res, next) => {
      try {
        const accountId = objectId(req.user.accountId);
        const loanEstimates = await LoanEstimateRepository.findMany({
          query: { accountId },
        }).toArray();

        res.json({ loanEstimates });
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    /**
     * Count enitities of loan estimates
     * @route GET /loans/estimates/count
     * @group LoanApp
     * @param {object} query.query - mongo query
     * @returns {number} 200 - number of entities
     * @security jwtToken
    */

    '/count',
    Celebrate({ query: Joi.object().required() }),
    async (req, res, next) => {
      try {
        const accountId = objectId(req.user.accountId);
        const query = req.query.query || {};
        const loanEstimates = await LoanEstimateRepository.count({
          query: { ...query, accountId },
        });

        res.json(loanEstimates);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    /**
     * Get list of open auctions for lenders
     * @route GET /loans/estimates/auctions
     * @group LoanApp
     * @security jwtToken
     * @returns {array} 200 - array of auctions
    */

    '/auctions',
    async (req, res, next) => {
      try {
        const auctions = await LoanApplicationRepository.findMany({
          query: { status: 'open' },
          fields: { accountId: 0 },
        }).toArray();

        res.json(auctions);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    /**
     * Find 1 loan estimate by provided query
     * @route GET /loans/esitmates/findOne
     * @group LoanApp
     * @param {object} query.query
     * @returns {object} 200 - loan estimate object
     * @security jwtToken
    */

    '/findOne',
    Celebrate({ query: Joi.object().required() }),
    async (req, res, next) => {
      try {
        const query = req.query.query ? JSON.parse(req.query.query) : {};
        query.accountId = objectId(req.user.accountId);
        const loanEstimate = await LoanEstimateRepository.findOne({ query });
        if (!loanEstimate) throw Boom.notFound('Unable to find loan estimate');

        res.json(loanEstimate);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    /**
     * Get all user's loan estimates
     * @route GET /loans/estimates/{id}
     * @group LoanApp
     * @param {string} id.path.required
     * @returns {object} 200 - loan estimate object
     * @security jwtToken
    */

    '/:id',
    async (req, res, next) => {
      try {
        const _id = objectId(req.params.id);
        const accountId = objectId(req.user.accountId);
        const loanEstimate = await LoanEstimateRepository.findOne({ query: { accountId, _id } });
        if (!loanEstimate) throw Boom.notFound('Unable to find loan estimate');

        res.json({ loanEstimate });
      } catch (err) {
        next(err);
      }
    },
  );

  router.patch(
    /**
     * Update loan estimate
     * @route PATCH /loans/estimates/:id
     * @group LoanApp
     * @param {string} amortizationType.body.required
     * @param {number} interestRate.body.required
     * @param {number} nrOfMonths.body.required
     * @security jwtToken
    */

    '/:id',
    Celebrate({ body: Joi.object().keys({
      amortizationType: Joi.string(),
      interestRate: Joi.number(),
      nrOfMonths: Joi.number(),
    }).required() }),
    async (req, res, next) => {
      try {
        const _id = objectId(req.params.id);
        const accountId = objectId(req.user.accountId);

        const loanEstimate = await LoanEstimateRepository.findOne({ query: { _id, accountId } });
        if (!loanEstimate) throw Boom.notFound('Unable to find loan estimate');

        await LoanEstimateRepository.updateOne({
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
    /**
     * Delete loan estimate
     * @route DELETE /loans/estimates/:id/
     * @group LoanApp
     * @param {string} id.path.required - mongo id
     * @security jwtToken
    */

    '/:id',
    async (req, res, next) => {
      try {
        const _id = objectId(req.params.id);
        const accountId = objectId(req.user.accountId);

        const result = await LoanEstimateRepository.deleteOne({ query: { _id, accountId } });
        if (!result) throw Boom.notFound('Unable to find loan estimate');

        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
};
