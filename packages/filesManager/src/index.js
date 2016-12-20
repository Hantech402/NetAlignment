import pkg from '../package.json';
import setupServices from './services';
import routes from './routes';

export function register(server, options, next) {
  const dispatcher = server.plugins['hapi-octobus'].eventDispatcher;
  const { mongoDb: db, refManager } = server.plugins['na-storage'];

  setupServices({ dispatcher, db, refManager });

  server.route(routes);

  next();
}

register.attributes = {
  pkg,
  dependencies: ['na-crud'],
};
