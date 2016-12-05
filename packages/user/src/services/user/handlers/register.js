import { decorators, applyDecorators } from 'octobus.js';
import Boom from 'boom';

const { withLookups, withHandler } = decorators;

const handler = async ({ params, Account, UserEntity }) => {
  const { username, email } = params;
  const existingUser = await UserEntity.findOne({
    query: {
      $or: [{
        username,
      }, {
        email,
      }],
    },
  });

  if (existingUser) {
    if (existingUser.username === username) {
      throw Boom.badRequest('Username already taken.');
    }

    if (existingUser.email === email) {
      throw Boom.badRequest('Email already taken.');
    }
  }

  const account = await Account.createOne({});

  const user = await UserEntity.createOne({
    accountId: account._id,
    isAccountOwner: true,
    ...params,
  });

  return {
    user,
    account,
  };
};

export default applyDecorators([
  withLookups({
    Account: 'entity.Account',
    UserEntity: 'entity.User',
  }),
  withHandler,
], handler);
