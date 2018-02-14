import { Repository } from 'makeen-mongodb';
import { decorators } from 'octobus.js';
import archiver from 'archiver';
import fs from 'fs';
import bluebird from 'bluebird';

import fileSchema from '../schemas/file';

const unlink = bluebird.promisify(fs.unlink);


const { service } = decorators;

export class FileManagerRepository extends Repository {
  constructor(config) {
    super(fileSchema);
    this.config = config;
  }

  setServiceBus(serviceBus) {
    super.setServiceBus(serviceBus);
  }

  @service()
  archiveDirs({ dirPath, res }) {
    const archive = archiver('zip');
    archive.on('error', err => { throw err; });
    archive.pipe(res);
    archive.directory(dirPath, false).finalize();
  }

  @service()
  archiveFiles({ filesPath, res }) {
    const archive = archiver('zip');
    archive.on('error', err => { throw err; });
    archive.pipe(res);

    filesPath.forEach(filePath => {
      const fileName = filePath.split('/').slice(-1)[0]; // get filename
      archive.append(fs.createReadStream(filePath), { name: fileName });
    });

    archive.finalize();
  }

  @service()
  deleteMany({ query }) {
    const filesToDelete = [];
    return super.findMany({ query }).toArray()
      .then(files => {
        files.forEach(file => {
          filesToDelete.push(unlink(file.filename));
        });
        return Promise.all(filesToDelete);
      })
      .then(() => super.deleteMany({ query }));
  }
}
