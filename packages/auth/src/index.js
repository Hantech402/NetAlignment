import { Module } from 'makeen';

import { setupMiddleware } from './middlewares';

export class AuthModule extends Module {
  name = 'net-alignments.auth';

  async setup(config) {
    const [
      { createServiceBus },
    ] = await this.dependencies([
      'makeen.octobus',
    ]);

    this.serviceBus = createServiceBus(this.name);

    const permissions = setupMiddleware({
      jwtSecret: config.jwtSecret,
    });

    this.export({
      permissions,
    });
  }
}
