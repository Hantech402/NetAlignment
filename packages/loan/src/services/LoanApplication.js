import { CRUDServiceContainer } from 'octobus-crud';
import { decorators } from 'octobus.js';
import { ObjectId as objectId } from 'mongodb';

import schema from '../schemas/loanApplication';

const { service } = decorators;

class LoanApplicationRepository extends CRUDServiceContainer {
  constructor({ store }) {
    super(store, schema);
  }

  setServiceBus(...args) {
    super.setServiceBus(...args);

    this.LoanEstimateRepository = this.extract('LoanEstimateRepository');
    this.UserRepository = this.extract('user.UserRepository');
  }

  @service()
  async deleteOne({ query }, { next }) {
    const loanApplication = await this.findOne({ query });

    if (loanApplication.status === 'open') {
      throw new Error("Can't delete an open loanApplication.");
    }

    return next();
  }

  async getAllAplicationsAndEstimates({ accountId, userId }) {
    const { LoanEstimateRepository } = this;
    const loanApplicationQuery = {
      status: { $in: ['open'] },
    };
    const loanEstimateQuery = {
      accountId: objectId(accountId),
    };

    /*
    const user = await this.serviceBus.messageBus.send(
      new Message({
        topic: 'user.UserRepository.findById',
        data: objectId(userId),
      }),
    );
    */

    const user = await this.UserRepository.findById(objectId(userId));

    const isBorrower = user.role === 'borrower';
    if (isBorrower) {
      loanApplicationQuery.accountId = objectId(accountId);
      delete loanEstimateQuery.accountId;
    }

    const loanApplications = await this.findMany({
      query: loanApplicationQuery,
    }).then(c => c.toArray());

    const loanEstimates = await LoanEstimateRepository.findMany({
      query: loanEstimateQuery,
    }).then(c => c.toArray());

    return {
      loanApplications,
      loanEstimates,
    };
  }

  @service()
  async getOpenLoanApplications({ accountId, userId }) {
    const {
      loanApplications,
      loanEstimates,
    } = await this.getAllAplicationsAndEstimates({ accountId, userId });
    const estimatedApplicationIds = loanEstimates.map(e =>
      e.loanApplicationId.toString());

    return loanApplications.filter(
      ({ _id }) => estimatedApplicationIds.indexOf(_id.toString()) === -1,
    );
  }

  @service()
  async getLoanApplicationsWithEstimates({ accountId, userId }) {
    const {
      loanApplications,
      loanEstimates,
    } = await this.getAllAplicationsAndEstimates({ accountId, userId });
    const estimatedApplicationIds = loanEstimates.map(e =>
      e.loanApplicationId.toString());

    return loanApplications
      .filter(({ _id }) => estimatedApplicationIds.indexOf(_id.toString()) > -1)
      .map(loanApplication => ({
        ...loanApplication,
        loanEstimate: loanEstimates.find(
          e => e.loanApplicationId.toString() === loanApplication._id.toString(),
        ),
      }));
  }
}

export default LoanApplicationRepository;
