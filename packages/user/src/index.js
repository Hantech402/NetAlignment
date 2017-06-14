import { UserPlugin } from 'makeen-user/build/index';
import Joi from 'joi';

import pluginOptionsSchema from './schemas/pluginOptions';

import UserService from './services/User';
import AccountService from './services/Account';
import UserRouter from './routers/User';
import AccountRouter from './routers/Account';

import userSchema from './schemas/user';
import accountSchema from './schemas/account';

import pkg from '../package.json';

class User extends UserPlugin {
  setupRouters(
    {
      UserRepository,
      UserLoginRepository,
      AccountRepository,
      ...options
    },
  ) {
    const userService = this.serviceBus.register(
      new UserService({ jwtConfig: options.jwt }),
    );

    const accountService = this.serviceBus.register(new AccountService());
    const { LoanApplicationRepository } = this.server.plugins['na-loan'];

    return this.mountRouters([
      new UserRouter(
        {
          User: userService,
          Account: accountService,
          UserLoginRepository,
          UserRepository,
          AccountRepository,
          LoanApplicationRepository,
        },
        {
          entitySchema: userSchema,
        },
      ),
      new AccountRouter(
        {
          User: userService,
          Account: accountService,
        },
        {
          entitySchema: accountSchema,
        },
      ),
    ]);
  }
}

export async function register(server, options, next) {
  try {
    const pluginOptions = Joi.attempt(options, pluginOptionsSchema);
    await server.register([
      {
        register: new User().register,
        options: {
          ...pluginOptions,
          userSchema,
          accountSchema,
        },
      },
    ]);

    next();
  } catch (err) {
    next(err);
  }
}

register.attributes = {
  pkg,
  dependencies: ['makeen-core', 'na-loan'],
};
