import { Repository } from 'makeen-mongodb';
import { decorators } from 'octobus.js';
import path from 'path';
import bluebird from 'bluebird';
import pick from 'lodash/pick';

import accountSchema from '../schemas/accountSchema';

const mkdir = bluebird.promisify(require('fs').mkdir);

const { service } = decorators;

export class AccountRepositoryServices extends Repository {
  constructor() {
    super(accountSchema);
  }

  setServiceBus(serviceBus) {
    super.setServiceBus(serviceBus);
  }

  @service()
  createOne({ userId, ...userData }) {
    let acc;
    return super.createOne({
      ownerId: userId,
      ...pick(userData, ['licenseNr']),
    })
      .then(account => {
        acc = account;
        const accountId = account._id.toString();
        return mkdir(path.join(__dirname, '../../../../', 'usersFiles', accountId));
      })
      .then(() => acc);
  }
}
