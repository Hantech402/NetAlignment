import Joi from 'joi';

export default {
  street: Joi.string().allow(''),
  city: Joi.string().allow(''),
  state: Joi.string().allow(''),
  zipCode: Joi.string().allow(''),
};
