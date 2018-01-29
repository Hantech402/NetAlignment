import { Module } from 'makeen';

import { userRouter } from './routes/auth';
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
    const UserRepository = bindRepository(new UserRepositoryService({ jwtSecret: config.jwtSecret, AccountRepository }));

    // const services = this.serviceBus.registerServices({ UserRepository });

    addRouter(
      '/users',
      'authRouter',
      userRouter({
        UserRepository,
        AccountRepository,
        config,
      }),
    );
  }
}
