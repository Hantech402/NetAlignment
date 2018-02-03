import { Module } from 'makeen';
import { setupMiddleware } from './middlewares';

export class AuthModule extends Module {
  name = 'net-alignments.auth';

  async setup(config) {
    const [
      // { UserRepository },
      // { permissionsManager },
      { createServiceBus },
    ] = await this.dependencies([
      // 'net-alignments.users',
      // 'makeen.security',
      'makeen.octobus',
    ]);

    this.serviceBus = createServiceBus(this.name);
    const permissions = setupMiddleware({ jwtSecret: config.jwtSecret });

    this.export({
      permissions,
    });
  }
}
