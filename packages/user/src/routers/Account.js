import Joi from 'joi';
import AccountRouter from 'makeen-user/build/routers/Account';
import { route } from 'makeen-router';
import { ObjectID as objectId } from 'mongodb';
import Boom from 'boom';
import { pick } from 'lodash';

class NetAlignAccountRouter extends AccountRouter {
  constructor(
    {
      User,
      Account,
    },
    config = {},
  ) {
    super(
      {
        User,
        Account,
      },
      config,
    );

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

  @route.get({
    path: '/find-broker',
    config: {
      auth: false,
      validate: {
        query: {
          employeeEmail: Joi.string().email(),
          licenseNumber: Joi.string(),
        },
      },
      description: 'Finder broker via email or license number',
    },
  })
  async findBroker(request) {
    const { licenseNumber, employeeEmail } = request.query;

    try {
      const query = {
        isActive: true,
        isDeactivated: false,
        isConfirmed: true,
      };

      if (licenseNumber) {
        query.licenseNr = licenseNumber;
      }

      if (employeeEmail) {
        query.loanOfficersEmails = employeeEmail;
      }

      const account = await this.Account.AccountRepository.findOne({ query });

      if (!account) {
        return Boom.notFound('Unable to find account!');
      }

      const user = await this.User.UserRepository.findOne({
        query: {
          accountId: account._id,
          role: 'broker',
          isAccountOwner: true,
        },
      });

      if (!user) {
        return Boom.notFound('Unable to find account!');
      }

      return {
        accountId: account._id,
        userId: user._id,
        ...pick(user, ['firstName', 'middleName', 'lastName']),
      };
    } catch (err) {
      return Boom.wrap(err);
    }
  }
}

export default NetAlignAccountRouter;
