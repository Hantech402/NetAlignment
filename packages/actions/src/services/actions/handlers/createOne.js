import { decorators, applyDecorators } from 'octobus.js';
import Joi from 'joi';

const { withHandler, withSchema } = decorators;

const schema = Joi.object()
  .keys({
    userId: Joi.object().required(),
  })
  .unknown()
  .required();

const handler = async ({ params, next }) =>
  next({
    ...params,
    timestamp: new Date(),
  });

export default applyDecorators([withSchema(schema), withHandler], handler);
