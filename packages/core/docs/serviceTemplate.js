import { decorators, applyDecorators } from 'octobus.js';
import Joi from 'joi';

const { withLookups, withHandler, withSchema } = decorators;

const schema = Joi.object().keys({
}).required();

const handler = async ({ params, next }) => { // eslint-disable-line arrow-body-style
  return next(params);
};

export default applyDecorators([
  withSchema(schema),
  withLookups({
  }),
  withHandler,
], handler);
