import { CRUDServiceContainer } from 'octobus-crud';
import { decorators } from 'octobus.js';

import schema from '../schemas/loanApplication';

const { service } = decorators;

class LoanApplicationRepository extends CRUDServiceContainer {
  constructor({ store }) {
    super(store, schema);
  }

  @service()
  async deleteOne({ query }, { next }) {
    const loanApplication = await this.findOne({ query });

    if (loanApplication.status === 'open') {
      throw new Error("Can't delete an open loanApplication.");
    }

    return next();
  }
}

export default LoanApplicationRepository;
