import Inert from 'inert';
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

  const LoanApplicationEntity = lookup('entity.LoanApplication');
  const FileEntity = lookup('entity.File');

  server.expose('LoanApplicationEntity', LoanApplicationEntity);

  server.bind({
    dispatch,
    lookup,
    LoanApplicationEntity,
    FileEntity,
  });

  server.route(routes);

  server.register([
    Inert,
  ], next);
}

register.attributes = {
  pkg,
  dependencies: ['na-storage', 'na-crud', 'na-files-manager'],
};

export {
  schemas,
};
