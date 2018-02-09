import { Module } from 'makeen';
import { LoanApplicationRepositoryService } from './services/LoanRepositoryService';

import { applicationRouter } from './router/application';

export class LoanApplicationModule extends Module {
  name = 'net-alignments.loan';

  async setup() {
    const [
      { bindRepository },
      { createServiceBus },
      { addRouter },
      { permissions },
      { FileManagerService },
    ] = await this.dependencies([
      'makeen.mongoDb',
      'makeen.octobus',
      'makeen.router',
      'net-alignments.auth',
      'net-alignments.fileManager',
    ]);

    this.serviceBus = createServiceBus(this.name);

    const LoanApplicationRepository = bindRepository(new LoanApplicationRepositoryService());

    addRouter(
      '/loans/applications',
      'loanRouter',
      applicationRouter({
        LoanApplicationRepository,
        permissions,
        FileManagerService,
      }),
    );
  }
}
