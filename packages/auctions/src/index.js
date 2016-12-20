import pkg from '../package.json';
import setupServices from './services/index';
import routes from './routes';
import * as schemas from './schemas';

export function register(server, options, next) {
  const dispatcher = server.plugins['hapi-octobus'].eventDispatcher;
  const { dispatch, lookup } = dispatcher;
  const { mongoDb, refManager } = server.plugins['na-storage'];

  setupServices({
    dispatcher,
    db: mongoDb,
    refManager,
  });

  const AuctionEntity = lookup('entity.Auction');
  const FileEntity = lookup('entity.File');

  server.expose('AuctionEntity', AuctionEntity);

  server.bind({
    dispatch,
    lookup,
    AuctionEntity,
    FileEntity,
  });

  server.route(routes);

  return next();
}

register.attributes = {
  pkg,
  dependencies: ['na-storage', 'na-crud', 'na-files-manager'],
};

export {
  schemas,
};
