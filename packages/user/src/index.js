import { UserPlugin } from 'makeen-user/build/index';

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
    },
  ) {
    const userService = this.serviceBus.register(
      new UserService({ jwtConfig: pluginOptionsSchema.jwt }),
    );

    const accountService = this.serviceBus.register(new AccountService());
    return this.mountRouters([
      new UserRouter({
        User: userService,
        Account: accountService,
        UserLoginRepository,
        UserRepository,
        AccountRepository,
      }),
      new AccountRouter({
        User: userService,
        Account: accountService,
      }),
    ]);
  }
}

export async function register(server, options, next) {
  try {
    await server.register([
      {
        register: new User().register,
        options: {
          ...options,
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
  dependencies: ['makeen-core'],
};
