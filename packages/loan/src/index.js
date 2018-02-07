import { Module } from 'makeen';
import { LoanApplicationRepositoryService } from './services/LoanRepositoryService';

import { loanRouter } from './routes';
// import { FileManagerRepository } from '../../fileManager/src/services/filesManagerService';

export class LoanApplicationModule extends Module {
  name = 'net-alignments.loan';

  async setup() {
    const [
      { bindRepository },
      { createServiceBus },
      { addRouter },
      { permissions },
    ] = await this.dependencies([
      'makeen.mongoDb',
      'makeen.octobus',
      'makeen.router',
      'net-alignments.auth',
    ]);

    this.serviceBus = createServiceBus(this.name);

    const LoanApplicationRepository = bindRepository(new LoanApplicationRepositoryService());

    addRouter(
      '/loans',
      'loanRouter',
      loanRouter({
        LoanApplicationRepository,
        permissions,
      }),
    );
  }
}
