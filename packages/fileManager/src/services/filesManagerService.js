import { Repository } from 'makeen-mongodb';

import fileSchema from '../schemas/file';

export class FileManagerRepository extends Repository {
  constructor() {
    super(fileSchema);
  }

  setServiceBus(serviceBus) {
    super.setServiceBus(serviceBus);
  }
}