import Joi from 'joi';

export const addressSchema = {
  street: Joi.string(),
  city: Joi.string(),
  state: Joi.string(),
  zipCode: Joi.string(),
};

