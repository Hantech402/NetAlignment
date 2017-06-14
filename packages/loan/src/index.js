import { Plugin } from 'makeen-core';
import LoanApplicationService from './services/LoanApplication';
import LoanApplicationRouter from './routers/LoanApplication';
import pkg from '../package.json';

class Loan extends Plugin {
  async boot(server) {
    const LoanApplicationRepository = new LoanApplicationService({
      store: this.createStore({ collectionName: 'LoanApplication' }),
    });
    const FileRepository = server.plugins['makeen-storage'].File.extract(
      'FileRepository',
    );

    const loanApplicationRouter = new LoanApplicationRouter(
      {
        LoanApplicationRepository,
        FileRepository,
      },
      {
        auth: {
          strategy: 'jwt',
          scope: 'borrower',
        },
      },
    );

    this.createResource('LoanApplication', {
      repository: LoanApplicationRepository,
      router: loanApplicationRouter,
    });

    server.bind({
      LoanApplicationRepository,
    });
  }
}

export const { register } = new Loan();

register.attributes = {
  pkg,
};
