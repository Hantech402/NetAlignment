import { Repository } from 'makeen-mongodb';
import { decorators } from 'octobus.js';

import fileSchema from '../schemas/file';

const { service } = decorators;

export class FileManagerRepository extends Repository {
  constructor() {
    super(fileSchema);
  }

  setServiceBus(serviceBus) {
    super.setServiceBus(serviceBus);
  }
}
