import Joi from 'joi';

export default {
  _id: Joi.object(),
  accountId: Joi.object().required(),

  username: Joi.string().required(),
  firstName: Joi.string(),
  lastName: Joi.string(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  salt: Joi.string(),
  status: Joi.string(),
  resetPassword: Joi.object().keys({
    token: Joi.string(),
    resetAt: Joi.date(),
  }).default({}),
  lastLogin: Joi.date(),
  roles: Joi.array().items(Joi.string()),
  isAccountOwner: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
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
