import { Plugin } from 'makeen-core';
import LoanApplicationService from './services/LoanApplication';
import LoanApplicationRouter from './routers/LoanApplication';
import LoanEstimateRouter from './routers/LoanEstimate';
import pkg from '../package.json';
import loanEstimateSchema from './schemas/loanEstimate';

class Loan extends Plugin {
  async boot(server) {
    const LoanApplicationRepository = new LoanApplicationService({
      store: this.createStore({ collectionName: 'LoanApplication' }),
    });
    const FileRepository = server.plugins['makeen-storage'].File.extract(
      'FileRepository',
    );
    const LoanEstimateRepository = this.createRepository(
      'LoanEstimate',
      loanEstimateSchema,
    );

    const loanApplicationRouter = new LoanApplicationRouter({
      LoanApplicationRepository,
      FileRepository,
      LoanEstimateRepository,
    });
    const loanEstimateRouter = new LoanEstimateRouter(
      {
        LoanEstimateRepository,
      },
      {
        auth: {
          strategy: 'jwt',
          scope: 'lender',
        },
      },
    );

    this.createResource('LoanApplication', {
      repository: LoanApplicationRepository,
      router: loanApplicationRouter,
    });

    this.createResource('LoanEstimate', {
      repository: LoanEstimateRepository,
      router: loanEstimateRouter,
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
