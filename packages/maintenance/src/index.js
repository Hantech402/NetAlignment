import pkg from '../package.json';
import routes from './routes';

export function register(server, options, next) {
  const { AccountEntity } = server.plugins['makeen-user'];

  server.bind({
    AccountEntity,
  });

  server.route(routes);

  next();
}

register.attributes = {
  pkg,
  dependencies: ['hapi-octobus', 'makeen-user'],
};
