import UsersRouter from 'makeen-user/build/routers/Users';
import { route } from 'makeen-router';
import { pick } from 'lodash';
import Joi from 'joi';
import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';

import userSchema from '../schemas/user';
import accountSchema from '../schemas/account';
import loanApplicationSchema from '../../../loan/src/schemas/loanApplication';

export default class NetAlignUserRouter extends UsersRouter {
  constructor(
    {
      User,
      UserRepository,
      UserLoginRepository,
      Account,
      AccountRepository,
      LoanApplicationRepository,
    },
    options = {},
  ) {
    super(
      {
        User,
        UserRepository,
        UserLoginRepository,
        Account,
        AccountRepository,
      },
      options,
    );

    this.User = User;
    this.UserRepository = UserRepository;
    this.Account = Account;
    this.AccountRepository = AccountRepository;
    this.LoanApplicationRepository = LoanApplicationRepository;

    this.jwtConfig = options.jwtConfig;
  }
  @route.get({
    path: '/me',
    config: {
      auth: false,
      description: 'Disabled route please use "/users/profile"!',
    },
  })
  disabledMe() {
    return Boom.methodNotAllowed();
  }

  @route.get({
    path: '/profile',
    config: {
      description: 'User profile',
    },
  })
  async getProfile(request) {
    const userId = objectId(request.auth.credentials.id);
    const user = await this.UserRepository.findById(userId);
    return {
      ...(await this.User.dump(user)),
      profilePicture: request.server.settings.app.uploadDir,
    };
  }

  @route.post({
    path: '/signup',
    config: {
      auth: false,
      description: 'Disabled route please use "/users/register"!',
    },
  })
  signup() {
    return Boom.methodNotAllowed();
  }

  @route.post({
    path: '/register',
    config: {
      auth: false,
      validate: {
        payload: {
          ...pick(userSchema, [
            'title',
            'firstName',
            'middleName',
            'lastName',
            'address',
            'password',
            'username',
            'email',
          ]),
          ...pick(accountSchema, ['loanOfficersEmails']),
          role: Joi.string().required().valid(['lender', 'borrower', 'broker']),
          loanApplication: Joi.any().when('role', {
            is: 'borrower',
            then: Joi.object().keys(
              pick(loanApplicationSchema, [
                'financialGoal',
                'rate',
                'termsByRate',
              ]),
            ),
          }),
          licenseNr: Joi.any().when('role', {
            is: Joi.any().valid(['lender', 'broker']),
            then: Joi.string().required(),
          }),
          employeesNr: Joi.number().allow(null),
        },
      },
      description: 'Register user account',
    },
  })
  async register(request) {
    const { User, LoanApplicationRepository } = this;
    const { role, licenseNr, email, loanApplication } = request.payload;
    const brokerAccount = await User.validateLicenseNumber(role, licenseNr);
    const brokerAccountId = await User.validateLenderRegistration(
      role,
      email,
      brokerAccount,
    );

    const { user, account } = await User.register({
      ...request.payload,
      brokerAccountId,
    });

    if (user.role === 'borrower' && loanApplication) {
      await LoanApplicationRepository.createOne({
        ...loanApplication,
        status: 'draft',
        accountId: account._id,
      });
    }

    return { user, account };
  }
}
