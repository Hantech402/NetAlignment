import * as HapiOctobus from 'hapi-octobus';
import { OctobusWithLogger } from 'octobus.js';
import pkg from '../package.json';
import setupServices from './services';

export function register(server, options, next) {
  process.on('unhandledRejection', (reason, p) => {
    console.log(reason);
    server.log(`Unhandled Rejection at: Promise ${p}, reason: ${reason}`);
    throw reason;
  });

  server.register([{
    register: HapiOctobus,
    options: {
      eventDispatcher: new OctobusWithLogger({
        log(msg) { console.log(msg); }, // eslint-disable-line no-console
        logParams: false,
        logSubscriptions: false,
      }),
    },
  }]).then(() => {
    const dispatcher = server.plugins['hapi-octobus'].eventDispatcher;

    setupServices(dispatcher);

    return next();
  }, next);
}

register.attributes = {
  pkg,
  dependencies: [],
};

export * from './libs';
export * from './decorators';
export * as pre from './pre';
export * as handlers from './handlers';
