import { Module } from 'makeen';

import { LoanApplicationRepositoryService } from './services/LoanRepositoryService';
import { LoanEstimateRepositoryService } from './services/EstimateRepositoryService';

import { loanRouter } from './router';

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
    const LoanEstimateRepository = bindRepository(new LoanEstimateRepositoryService());

    addRouter(
      '/loans',
      'loanRouter',
      loanRouter({
        LoanApplicationRepository,
        LoanEstimateRepository,
        permissions,
        FileManagerService,
      }),
    );

    this.export({ LoanApplicationRepository });
  }
}
