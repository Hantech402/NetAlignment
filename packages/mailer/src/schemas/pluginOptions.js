import Joi from 'joi';

export default {
  transport: Joi.object().keys({
    pool: Joi.boolean(),
    host: Joi.string().required(),
    port: Joi.number().required(),
    secure: Joi.boolean(),
    auth: Joi.object().keys({
      user: Joi.string(),
      pass: Joi.string(),
    }).required(),
    logger: Joi.boolean().default(false),
    debug: Joi.boolean().default(false),
  }),
  saveToDisk: Joi.boolean().default(false),
  emailsDir: Joi.string(),
};
