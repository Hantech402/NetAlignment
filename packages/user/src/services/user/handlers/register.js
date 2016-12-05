import { decorators, applyDecorators } from 'octobus.js';
import Boom from 'boom';

const { withLookups, withHandler } = decorators;

const handler = async ({ username, email, password, Account, UserEntity }) => {
  const existingUser = await UserEntity.findOne({
    query: {
      $or: [{
        username,
      }, {
        email: username,
      }],
    },
  });

  if (existingUser) {
    throw Boom.badRequest('Username already taken.');
  }

  const account = await Account.createOne({});

  const user = await UserEntity.createOne({
    accountId: account._id,
    isAccountOwner: true,
    username,
    email,
    password,
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
