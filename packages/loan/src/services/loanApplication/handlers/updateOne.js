import { decorators, applyDecorators } from 'octobus.js';
import Joi from 'joi';

const { withLookups, withHandler, withSchema } = decorators;

const schema = Joi.object().keys({
  query: Joi.object().required(),
  update: Joi.object().required(),
}).required();

const handler = async ({ params, next, LoanApplicationEntity }) => {
  // console.log('test');
  return next(params);
};

export default applyDecorators([
  withSchema(schema),
  withLookups({
    LoanApplicationEntity: 'entity.LoanApplication',
  }),
  withHandler,
], handler);
