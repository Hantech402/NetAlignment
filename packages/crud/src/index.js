import pkg from '../package.json';
import routesGenerator from './libs/routesGenerator';

export function register(server, options, next) {
  next();
}

register.attributes = {
  pkg,
  dependencies: ['hapi-octobus', 'na-user'],
};

export {
  routesGenerator as generateCRUDRoutes,
};
