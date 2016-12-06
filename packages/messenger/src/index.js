import pkg from '../package.json';
import setupServices from './services/index';

export function register(server, options, next) {
  const dispatcher = server.plugins['hapi-octobus'].eventDispatcher;
  const { mongoDb: db } = server.plugins['hb-storage'];

  setupServices({ dispatcher, db });

  next();
}

register.attributes = {
  pkg,
  dependencies: ['na-crud'],
};
