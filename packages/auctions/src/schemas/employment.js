import Joi from 'joi';

export default {
  employer: Joi.object().keys({
    name: Joi.string(),
    address: Joi.string(),
  }),
  isSelfEmployed: Joi.boolean().default(false),
  years: Joi.object().keys({
    onJob: Joi.number().integer().min(0),
    onProfession: Joi.number().integer().min(0),
  }),
  dates: Joi.object().keys({
    from: Joi.date(),
    to: Joi.date(),
  }),
  title: Joi.string(),
  businessPhone: Joi.string(),
  monthlyIncome: Joi.number(),
};
