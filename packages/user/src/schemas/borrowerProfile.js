import Joi from 'joi';
import { maritalStatuses } from '../constants';

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
    street: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    ZIP: Joi.string(),
    ownership: Joi.string().valid(['Own', 'Rent']),
    rentYears: Joi.number(),
  }),
  mailingAddress: Joi.string(),
};
