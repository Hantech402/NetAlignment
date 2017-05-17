import Joi from 'joi';
import { STATUSES } from '../constants';

const historyItem = {
  userId: Joi.object(),
  timestamp: Joi.date().required(),
  status: Joi.string().valid(STATUSES).default('pending'),
};

export default options => ({
  _id: Joi.object(),
  name: Joi.string().valid(options.validActions).required(),
  payload: Joi.object().default({}), // immutable - should never change
  ...historyItem,
  history: Joi.array().items(Joi.object().keys(historyItem)).default([]),
  meta: Joi.object().default({}),
});
