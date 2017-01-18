import Joi from 'joi';

export default {
  baseEmplIncome: Joi.number(),
  overtime: Joi.number(),
  bonuses: Joi.number(),
  commisions: Joi.number(),
  dividendsOrInterest: Joi.number(),
  netRentalIncome: Joi.number(),
  other: Joi.number(),
};
