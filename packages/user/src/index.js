import Joi from 'joi';
import * as hbUser from 'hb-user';
import pick from 'lodash/pick';
import pkg from '../package.json';
import pluginOptionsSchema from './schemas/pluginOptions';
import userSchema from './schemas/user';
import setupServices from './services/index';
import routes from './routes';

export function register(server, options, next) {
  const dispatcher = server.plugins['hapi-octobus'].eventDispatcher;
  const { dispatch, lookup } = dispatcher;
  const pluginOptions = Joi.attempt(options, pluginOptionsSchema);
  const { mongoDb, refManager } = server.plugins['na-storage'];

  if (pluginOptions.socialPlatforms.facebook) {
    server.auth.strategy('facebook', 'bell', {
      provider: 'facebook',
      isSecure: false,
      ...pluginOptions.socialPlatforms.facebook,
    });
  }

  if (pluginOptions.socialPlatforms.google) {
    server.auth.strategy('google', 'bell', {
      provider: 'google',
      isSecure: false,
      ...pluginOptions.socialPlatforms.google,
    });
  }

  server.register([{
    register: hbUser,
    options: {
      jwt: pluginOptions.jwt,
      serviceOptions: {
        ...pluginOptions.user,
        references: [{
          collectionName: 'Account',
          refProperty: 'accountId',
          extractor: (account = {}) =>
            pick(account, ['licenseNr', 'loanOfficersEmails']),
        }],
        schema: userSchema,
        db: mongoDb,
        refManager,
      },
    },
  }]).then(() => {
    setupServices({
      dispatcher,
      db: mongoDb,
      pluginOptions,
    });

    const UserEntity = lookup('entity.User');
    const AccountEntity = lookup('entity.Account');
    const User = lookup('User');
    const AuctionEntity = lookup('entity.Auction');

    server.expose('UserEntity', UserEntity);
    server.expose('AccountEntity', AccountEntity);
    server.expose('User', User);

    server.bind({
      dispatch,
      lookup,
      UserEntity,
      AccountEntity,
      User,
      AuctionEntity,
    });

    server.route(routes);

    return next();
  }, next);
}

register.attributes = {
  pkg,
  dependencies: ['na-storage', 'bell', 'na-crud', 'na-auctions'],
};
