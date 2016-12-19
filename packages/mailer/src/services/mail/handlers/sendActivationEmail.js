import Joi from 'joi';
import { decorators, applyDecorators } from 'octobus.js';

const { withSchema, withHandler } = decorators;

const schema = Joi.object().keys({
  user: Joi.object().required(),
  account: Joi.object().required(),
}).required();

export default (app) => {
  const handler = ({ user, account, dispatch }) => (
    dispatch('Mail.send', {
      to: user.email,
      subject: 'welcome',
      template: 'accountActivation',
      context: {
        user,
        account,
        app,
      },
    })
  );

  return applyDecorators([
    withSchema(schema),
    withHandler,
  ], handler);
};
