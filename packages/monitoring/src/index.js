import StatusMonitor from 'hapijs-status-monitor';
import Vision from 'vision';
import Inert from 'inert';
import Tv from 'tv';
import pkg from '../package.json';

export function register(server, options, next) {
  server.register([
    Vision,
    Inert,
    Tv,
    {
      register: StatusMonitor,
      options: {
        path: '/status-monitor',
      },
    },
  ], next);
}

register.attributes = {
  pkg,
  dependencies: [],
};
