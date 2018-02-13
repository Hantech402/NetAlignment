import { Repository } from 'makeen-mongodb';

import loanEstimateSchema from '../schemas/loanEstimate';

export class LoanEstimateRepositoryService extends Repository {
  constructor() {
    super(loanEstimateSchema);
  }

  setServiceBus(serviceBus) {
    super.setServiceBus(serviceBus);
  }
}
