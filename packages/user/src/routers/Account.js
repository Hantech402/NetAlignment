import Joi from 'joi';
import AccountRouter from 'makeen-user/build/routers/Account';
import { route } from 'makeen-router';
import { ObjectID as objectId } from 'mongodb';

class NetAlignAccountRouter extends AccountRouter {
  constructor(
    {
      User,
      Account,
    },
    config = {},
  ) {
    super({
      namespace: 'Account',
      basePath: '/account',
      ...config,
    });

    this.User = User;
    this.Account = Account;
  }

  @route.post({
    path: '/deactivate',
    config: {
      auth: {
        strategy: 'jwt',
        scope: 'borrower',
      },
      validate: {
        payload: {
          reason: Joi.string().required(),
        },
      },
      description: 'Deactivate account',
    },
  })
  deactivate(request) {
    const { Account } = this;
    const accountId = objectId(request.auth.credentials.accountId);
    const { reason } = request.payload;

    return Account.deactivate({
      _id: accountId,
      reason,
    });
  }
}

export default NetAlignAccountRouter;
