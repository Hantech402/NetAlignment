import { Repository } from 'makeen-mongodb';

import { loanApplication } from '../schemas';

export class LoanApplicationRepositoryService extends Repository {
  constructor() {
    super(loanApplication);
  }

  setServiceBus(serviceBus) {
    super.setServiceBus(serviceBus);
  }
}
