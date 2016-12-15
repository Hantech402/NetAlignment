import { decorators, applyDecorators } from 'octobus.js';
import Boom from 'boom';
import pick from 'lodash/pick';

const { withLookups, withHandler } = decorators;

const handler = async ({ username, email, params, Account, UserEntity }) => {
  const { licenseNr, loanOfficersEmails, ...userParams } = params;
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

  const account = await Account.createOne({
    licenseNr,
    loanOfficersEmails,
  });

  const user = await UserEntity.createOne({
    accountId: account._id,
    isAccountOwner: true,
    ...userParams,
  });

  return {
    user: pick(user, [
      'accountId', '_id', 'title', 'firstName', 'lastName', 'email', 'username', 'role',
      'address', 'isActive', 'createdAt', 'updatedAt',
    ]),
    account: pick(account, [
      'isConfirmed', 'isActive', '_id', 'updatedAt', 'createdAt',
    ]),
  };
};

export default applyDecorators([
  withLookups({
    Account: 'entity.Account',
    UserEntity: 'entity.User',
  }),
  withHandler,
], handler);
