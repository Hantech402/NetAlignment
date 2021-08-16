import Joi from 'joi';

const valueSchema = Joi.object().keys({
  present: Joi.number(),
  proposed: Joi.number(),
});

export default {
  rent: valueSchema,
  firstMortgage: valueSchema,
  otherFinancing: valueSchema,
  hazardInsurance: valueSchema,
  realEstateTaxes: valueSchema,
  mortgageInsurance: valueSchema,
  homeownerAssnDues: valueSchema,
  other: valueSchema,
};
