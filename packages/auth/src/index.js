import { Module } from 'makeen';

import { setupMiddleware } from './middlewares';
import { initializePermissions } from './libs/initializePermissions';

export class AuthModule extends Module {
  name = 'net-alignments.auth';

  async setup(config) {
    const [
      // { UserRepository },
      { permissionsManager },
      { createServiceBus },
    ] = await this.dependencies([
      // 'net-alignments.users',
      'makeen.security',
      'makeen.octobus',
    ]);

    this.serviceBus = createServiceBus(this.name);

    const initPermissionsManager = initializePermissions({ permissionsManager });

    const permissions = setupMiddleware({
      jwtSecret: config.jwtSecret,
      permissionsManager: initPermissionsManager,
    });

    this.export({
      permissions,
    });
  }
}
