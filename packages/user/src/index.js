import { Module } from 'makeen';

import { usersRouter } from './routes/users';
import { accountRouter } from './routes/account';
import { UserRepositoryService } from './services/UserRepositoryService';
import { AccountRepositoryServices } from './services/AccountRepositoryService';

export class UserModule extends Module {
  name = 'net-aligments.users'

  async setup(config) {
    const [
      { bindRepository },
      { createServiceBus },
      { addRouter },
    ] = await this.dependencies([
      'makeen.mongoDb',
      'makeen.octobus',
      'makeen.router',
    ]);

    this.serviceBus = createServiceBus(this.name);

    const AccountRepository = bindRepository(new AccountRepositoryServices());
    const UserRepository = bindRepository(new UserRepositoryService({
      config,
      AccountRepository,
    }));

    // const services = this.serviceBus.registerServices({ UserRepository });

    addRouter(
      '/users',
      'authRouter',
      usersRouter({
        UserRepository,
        AccountRepository,
        config,
      }),
    );

    addRouter(
      '/account',
      'accountRouter',
      accountRouter({
        UserRepository,
        AccountRepository,
        config,
      }),
    );
  }
}
