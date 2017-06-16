/* eslint-disable class-methods-use-this */
import { MongoResourceRouter } from 'makeen-router';
import { ObjectID as objectId } from 'mongodb';
import omit from 'lodash/omit';

import schema from '../schemas/loanEstimate';

class LoanEstimateRouter extends MongoResourceRouter {
  constructor(
    {
      LoanEstimateRepository,
    },
    config = {},
  ) {
    super(LoanEstimateRepository, {
      namespace: 'LoanEstimate',
      basePath: '/loans/estimates',
      scope: 'lender',
      entitySchema: omit(schema, [
        '_id',
        'accountId',
        'createdAt',
        'updatedAt',
      ]),
      ...config,
    });

    this.applyContext({
      generateContext: request => ({
        accountId: objectId(request.auth.credentials.accountId),
      }),
    });

    this.LoanEstimateRepository = LoanEstimateRepository;
  }
}

export default LoanEstimateRouter;
