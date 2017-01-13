import Joi from 'joi';
import addressSchema from 'na-core/src/schemas/address';
import { maritalStatuses } from '../constants';

export default {
  socialSecurityNumber: Joi.string().allow(''),
  homePhoneNr: Joi.string().allow(''),
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
