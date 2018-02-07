import Joi from 'joi';
import { maritalStatuses } from '../constants';

import { addressSchema } from './address';

export default {
  socialSecurityNumber: Joi.string(),
  homePhoneNr: Joi.string(),
  birthdate: Joi.object().keys({
    year: Joi.number(),
    month: Joi.number(),
    day: Joi.number(),
  }),
  yearsSchool: Joi.number(),
  maritalStatus: Joi.string().valid(maritalStatuses),
  dependents: Joi.array().items(Joi.object().keys({
    age: Joi.number(),
  })),
  presentAddress: Joi.object().keys({
    ...addressSchema,
    ownership: Joi.string().valid(['Own', 'Rent']),
    rentYears: Joi.number(),
  }),
  mailingAddress: addressSchema,
  formerAddress: Joi.object().keys({
    ...addressSchema,
    ownership: Joi.string().valid(['Own', 'Rent']),
    rentYears: Joi.number(),
  }),
};
