import Joi from 'joi';
import { statuses, financialGoals, rates } from '../constants';

export default {
  _id: Joi.object(),

  status: Joi.string().valid(statuses),
  financialGoal: Joi.string().valid(financialGoals),
  rate: Joi.string().valid(rates),

  isDeleted: Joi.boolean().default(false),
  deletedAt: Joi.date(),
  expiresAt: Joi.date(),

  createdAt: Joi.date(),
  updatedAt: Joi.date(),
};
