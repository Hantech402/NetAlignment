import { Repository } from 'makeen-mongodb';
import { decorators } from 'octobus.js';
// import path from 'path';
// import bluebird from 'bluebird';

import accountSchema from '../schemas/accountSchema';

// const mkdir = bluebird.promisify(require('fs').mkdir);

const { service } = decorators;

export class AccountRepositoryServices extends Repository {
  constructor() {
    super(accountSchema);
  }

  setServiceBus(serviceBus) {
    super.setServiceBus(serviceBus);
  }

  @service()
  createOne(userId) {
    // let acc;
    return super.createOne({ ownerId: userId });
      // .then(account => {
      //   acc = account;
      //   const accountId = account._id.toString();
      //   return mkdir(path.join(__dirname, '../../../../', accountId));
      // })
      // .then(() => acc);
  }
}

