import Joi from 'joi';

import { rates } from '../constants';

export default {
  _id: Joi.object(),
  accountId: Joi.object().required(),
  loanApplicationId: Joi.object().required(),
  amortizationType: Joi.alternatives(rates).required(),
  interestRate: Joi.number().min(1).max(100).required(),
  nrOfMonths: Joi.number().integer().min(1).required(),
  createdAt: Joi.date(),
  updatedAt: Joi.date(),
};
