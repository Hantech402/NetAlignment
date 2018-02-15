import { Module } from 'makeen';

import { usersRouter } from './router/users';
import { accountRouter } from './router/account';
import { UserRepositoryService } from './services/UserRepositoryService';
import { AccountRepositoryServices } from './services/AccountRepositoryService';

export class UserModule extends Module {
  name = 'net-alignments.users'

  async setup(config) {
    const [
      { bindRepository },
      { createServiceBus },
      { addRouter },
      { permissions },
      { LoanApplicationRepository },
    ] = await this.dependencies([
      'makeen.mongoDb',
      'makeen.octobus',
      'makeen.router',
      'net-alignments.auth',
      'net-alignments.loan',
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
        permissions,
        LoanApplicationRepository,
      }),
    );

    addRouter(
      '/account',
      'accountRouter',
      accountRouter({
        LoanApplicationRepository,
        UserRepository,
        AccountRepository,
        config,
        permissions,
      }),
    );

    this.export({ AccountRepository, UserRepository });
  }
}
