import Joi from 'joi';

export default {
  street: Joi.string(),
  city: Joi.string(),
  state: Joi.string(),
};
