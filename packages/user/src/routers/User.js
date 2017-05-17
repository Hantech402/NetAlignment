import UsersRouter from 'makeen-user/build/routers/Users';
import { route } from 'makeen-router';
import { pick } from 'lodash';
import Joi from 'joi';
import Boom from 'boom';

import userSchema from '../schemas/user';
import accountSchema from '../schemas/account';
import loanApplication from '../../../loan/src/schemas/loanApplication';

export default class NetAlignUserRouter extends UsersRouter {
  constructor(
    {
      User,
      UserRepository,
      Account,
      AccountRepository,
    },
    options = {},
  ) {
    super(options);

    this.User = User;
    this.UserRepository = UserRepository;
    this.Account = Account;
    this.AccountRepository = AccountRepository;
    this.jwtConfig = options.jwtConfig;
  }

  @route.post({
    path: '/signup',
    config: {
      auth: false,
      description: 'Disabled route please use "/user/register"!',
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
              pick(loanApplication, ['financialGoal', 'rate', 'termsByRate']),
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
    const { User } = this;
    const { role, licenseNr, email } = request.payload;
    const brokerAccount = await User.validateLicenseNumber(role, licenseNr);
    const brokerAccountId = await User.validateLenderRegistration(
      role,
      email,
      brokerAccount,
    );

    return User.register({
      ...request.payload,
      brokerAccountId,
    });
  }
}
