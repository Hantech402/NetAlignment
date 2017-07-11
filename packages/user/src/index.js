import { UserPlugin } from 'makeen-user/build/index';
import Joi from 'joi';
import { ObjectId as objectId } from 'mongodb';

import pluginOptionsSchema from './schemas/pluginOptions';

import UserService from './services/User';
import AccountService from './services/Account';
import UserRouter from './routers/User';
import AccountRouter from './routers/Account';

import userSchema from './schemas/user';
import accountSchema from './schemas/account';

import pkg from '../package.json';

class NetAlignUserPlugin extends UserPlugin {
  validateJWT = (decodedToken, request, cb) => {
    if (!decodedToken || !decodedToken.id) {
      cb(null, false);
    } else {
      this.serviceBus
        .send('UserRepository.findById', objectId(decodedToken.id))
        .then(
          result => {
            if (!result) {
              return cb(null, false); // new Error('User not found')
            }

            if (!result.labels.includes('isActive')) {
              return cb(null, false); // new Error('User is not active!')
            }

            return cb(null, true);
          },
          cb,
        );
    }
  };

  setupAuthStrategy({ jwt }) {
    this.server.auth.strategy('jwt', 'jwt', {
      key: jwt.key,
      validateFunc: this.validateJWT,
      verifyOptions: {
        algorithms: ['HS256'],
      },
    });

    this.server.auth.default('jwt');
  }

  setupRouters(
    {
      UserRepository,
      UserLoginRepository,
      ...options
    },
  ) {
    const userService = this.serviceBus.register(
      new UserService({ jwtConfig: options.jwt }),
    );
    const accountService = this.serviceBus.register(new AccountService());
    const AccountRepository = this.serviceBus.extract('AccountRepository');

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
          AccountRepository,
          UserRepository,
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
        register: new NetAlignUserPlugin().register,
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
