import { Module } from 'makeen';

import { maintenanceRouter } from './router';

export class MaintenanceModule extends Module {
  name = 'net-alignment.maintenance';

  async setup(config) {
    const [
      { createServiceBus },
      { addRouter },
      { permissions },
      { AccountRepository },
    ] = await this.dependencies([
      'makeen.octobus',
      'makeen.router',
      'net-alignments.auth',
      'net-alignments.users',
    ]);

    this.serviceBus = createServiceBus(this.name);

    addRouter(
      '/maintenance',
      'maintenanceRouter',
      maintenanceRouter({
        permissions,
        AccountRepository,
        config,
      }),
    );
  }
}
