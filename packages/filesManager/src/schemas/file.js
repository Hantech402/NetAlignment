import Joi from 'joi';

export default {
  _id: Joi.object(),
  accountId: Joi.object().required(),
  fromId: Joi.object().required(),
  toId: Joi.object().required(),

  body: Joi.string().required(),
  isRead: Joi.boolean().default(false),
  status: Joi.string().required(),

  sentAt: Joi.date(),
  readAt: Joi.date(),
  createdAt: Joi.date(),
  updatedAt: Joi.date(),
};
