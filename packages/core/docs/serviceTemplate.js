import { decorators, applyDecorators } from 'octobus.js';
import Joi from 'joi';

const { withLookups, withHandler, withSchema } = decorators;

const schema = Joi.object().keys({
}).required();

export default applyDecorators([
  withSchema(schema),
  withLookups({
  }),
  withHandler,
], async ({ params, next }) => { // eslint-disable-line arrow-body-style
  return next(params);
});
