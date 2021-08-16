import Joi from 'joi';
import Boom from 'boom';
import { decorators, applyDecorators } from 'octobus.js';

const { withSchema, withLookups, withHandler } = decorators;

const schema = Joi.object().keys({
  usernameOrEmail: Joi.string().required(),
}).required();

const handler = async ({ usernameOrEmail, AccountEntity, UserEntity, dispatch }) => {
  const user = await UserEntity.findOne({
    query: {
      $or: [{
        username: usernameOrEmail,
      }, {
        email: usernameOrEmail,
      }],
    },
  });

  if (!user) {
    throw Boom.badRequest('User not found!');
  }

  const account = await AccountEntity.findById(user.accountId);

  if (account.isConfirmed) {
    throw Boom.badRequest('Account is already confirmed!');
  }

  await dispatch('Mail.sendActivationEmail', {
    user, account,
  });

  return {
    user, account,
  };
};

export default applyDecorators([
  withSchema(schema),
  withLookups({
    AccountEntity: 'entity.Account',
    UserEntity: 'entity.User',
  }),
  withHandler,
], handler);
