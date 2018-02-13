import { Router } from 'express';
import Celebrate from 'celebrate';
import Joi from 'joi';
import omit from 'lodash/omit';
import { ObjectID as objectId } from 'mongodb';

import loanEstimateSchema from '../schemas/loanEstimate';

export const estimateRouter = config => {
  const {
    EstimateRepository,
    LoanApplicationRepository,
    permissions,
    FileManagerService,
  } = config;

  const router = Router();

  router.use(permissions.requireAuth, permissions.requireLender);

  router.post(
    /**
     * Create new loan estimate
     * @route POST /loans/estimates
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
        const loanEstimate = await EstimateRepository.createOne({
          ...req.body,
          loanApplicationId: objectId(req.body.loanApplicationId),
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
     * Get all user's loan estimates
     * @route GET /loans/estimates/
     * @returns {array} 200 - array of loan estimates with name loanEstimates
     * @security jwtToken
    */

    '/',
    async (req, res, next) => {
      try {
        const accountId = objectId(req.user.accountId);
        const loanEstimates = await EstimateRepository.findMany({
          query: { accountId },
        }).toArray();

        res.json({ loanEstimates });
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
};
