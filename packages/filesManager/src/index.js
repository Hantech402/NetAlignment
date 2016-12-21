import pkg from '../package.json';
import setupServices from './services';
import routes from './routes';

export function register(server, options, next) {
  const dispatcher = server.plugins['hapi-octobus'].eventDispatcher;
  const { mongoDb: db, refManager } = server.plugins['na-storage'];
  const { uploadDir } = server.settings.app;

  setupServices({
    dispatcher,
    db,
    refManager,
    uploadDir,
  });

  server.route(routes);

  next();
}

register.attributes = {
  pkg,
  dependencies: ['na-crud'],
};
