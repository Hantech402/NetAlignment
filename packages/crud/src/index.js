import pkg from '../package.json';
import routesGenerator from './libs/routesGenerator';

export function register(server, options, next) {
  server.expose('generateCRUDRoutes', routesGenerator);

  next();
}

register.attributes = {
  pkg,
  dependencies: ['hapi-octobus', 'na-user'],
};
