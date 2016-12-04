import Joi from 'joi';
import { titleOptions, roles } from '../constants';

export default {
  _id: Joi.object(),
  accountId: Joi.object().required(),

  username: Joi.string().required(),
  title: Joi.string().valid(titleOptions).default(titleOptions[0]),
  firstName: Joi.string(),
  middleName: Joi.string(),
  lastName: Joi.string(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  salt: Joi.string(),
  address: Joi.object().keys({
    streetAddress1: Joi.string(),
    streetAddress2: Joi.string(),
    country: Joi.string(),
    city: Joi.string(),
    county: Joi.string(),
    state: Joi.string(),
    zipCode: Joi.string(),
    phoneNumber: Joi.string(),
  }).default({}),

  status: Joi.string(),
  resetPassword: Joi.object().keys({
    token: Joi.string(),
    resetAt: Joi.date(),
  }).default({}),
  lastLogin: Joi.date(),
  role: Joi.string().required().valid(roles),
  isAccountOwner: Joi.boolean().default(false),
  isActive: Joi.boolean().default(false),
  socialLogin: Joi.object().keys({
    facebook: Joi.object().keys({
      id: Joi.string().required(),
      name: Joi.string(),
      email: Joi.string().email(),
      token: Joi.string().required(),
      expiresAt: Joi.date(),
    }),
    google: Joi.object().keys({
      id: Joi.string().required(),
      name: Joi.string(),
      email: Joi.string().email(),
      token: Joi.string().required(),
      expiresAt: Joi.date(),
    }),
  }).default({
  }),

  isDeleted: Joi.boolean().default(false),
  deletedAt: Joi.date(),

  createdAt: Joi.date(),
  updatedAt: Joi.date(),
};
