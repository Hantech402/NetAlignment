import Joi from 'joi';
import Boom from 'boom';
import { decorators, applyDecorators } from 'octobus.js';

const { withSchema, withLookups, withHandler } = decorators;

const schema = Joi.object().keys({
  username: Joi.string().required(),
  password: Joi.string().required(),
  skipDeactivationCheck: Joi.boolean().default(false),
}).required();

const handler = async ({ username, UserEntity, AccountEntity, next, params }) => {
  const { skipDeactivationCheck, ...restParams } = params;
  const user = await UserEntity.findOne({ query: { username } });

  if (!user) {
    throw Boom.badRequest('User not found!');
  }

  if (!user.isActive) {
    throw Boom.badRequest('User is not active!');
  }

  const account = await AccountEntity.findById(user.accountId);

  if (!account.isConfirmed) {
    throw Boom.badRequest('Account is not confirmed!');
  }

  if (!account.isActive) {
    throw Boom.badRequest('Account is not active!');
  }

  if (!skipDeactivationCheck && account.isDeactivated) {
    throw Boom.badRequest('Your account is deactivated!', {
      reason: account.deactivationReason,
    });
  }

  return next(restParams);
};

export default applyDecorators([
  withSchema(schema),
  withLookups({
    UserEntity: 'entity.User',
    AccountEntity: 'entity.Account',
  }),
  withHandler,
], handler);
