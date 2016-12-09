import pkg from '../package.json';
import setupServices from './services/index';
import routes from './routes';
import * as schemas from './schemas';

export function register(server, options, next) {
  const dispatcher = server.plugins['hapi-octobus'].eventDispatcher;
  const { dispatch, lookup } = dispatcher;
  const { mongoDb } = server.plugins['na-storage'];

  setupServices({
    dispatcher,
    db: mongoDb,
  });

  const AuctionEntity = lookup('entity.Auction');

  server.expose('AuctionEntity', AuctionEntity);

  server.bind({
    dispatch,
    lookup,
    AuctionEntity,
  });

  server.route(routes);

  return next();
}

register.attributes = {
  pkg,
  dependencies: ['na-storage', 'na-crud'],
};

export {
  schemas,
};
