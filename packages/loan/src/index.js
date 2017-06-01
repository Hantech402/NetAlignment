import { Plugin } from 'makeen-core';
import LoanApplicationService from './services/LoanApplication';
import LoanApplicationRouter from './routers/LoanApplication';

class Loan extends Plugin {
  async boot(server) {
    const LoanApplicationRepository = new LoanApplicationService({
      store: this.createStore({ collectionName: 'LoanApplication' }),
    });

    const loanApplication = new LoanApplicationRouter(
      LoanApplicationRepository,
      {
        auth: {
          strategy: 'jwt',
          scope: 'borrower',
        },
      },
    );

    this.createResource('LoanApplication', {
      repository: LoanApplicationRepository,
      router: loanApplication,
    });

    server.bind({
      LoanApplicationRepository,
    });
  }
}

export const { register } = new Loan();
