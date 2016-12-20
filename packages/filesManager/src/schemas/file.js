import Joi from 'joi';

export default {
  _id: Joi.object(),
  accountId: Joi.object().required(),
  filename: Joi.string().required(),
  contentType: Joi.string().required(),
  extension: Joi.string().required(),
  path: Joi.string(),
  size: Joi.number().required(),
  uploadedAt: Joi.date(),
};
