import Joi from 'joi';
import { statuses, financialGoals, rates, termsByRate } from '../constants';

export default {
  _id: Joi.object(),
  accountId: Joi.object().required(),

  status: Joi.string().valid(statuses),
  financialGoal: Joi.string().valid(financialGoals).required(),
  rate: Joi.string().valid(rates).required(),
  termsByRate: Object.keys(termsByRate).reduce((validator, rateValue) => (
    validator.when('rate', {
      is: rateValue,
      then: Joi.string().required().valid(termsByRate[rateValue]),
    })
  ), Joi.alternatives()),

  isDeleted: Joi.boolean().default(false),
  deletedAt: Joi.date(),
  expiresAt: Joi.date(),

  createdAt: Joi.date(),
  updatedAt: Joi.date(),
};
