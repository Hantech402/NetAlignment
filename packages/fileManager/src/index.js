import { Module } from 'makeen';

import { FileManagerRepository } from './services/filesManagerService';
import { fileManagerRouter } from './routes';

export class FileManager extends Module {
  name = 'net-alignments.fileManager';

  async setup(config) {
    const [
      { bindRepository },
      { createServiceBus },
      { addRouter },
      { permissions },
    ] = await this.dependencies([
      'makeen.mongoDb',
      'makeen.octobus',
      'makeen.router',
      'net-alignments.auth',
    ]);

    this.serviceBus = createServiceBus(this.name);
    const FileManagerService = bindRepository(new FileManagerRepository());

    addRouter(
      '/files',
      'fileRouter',
      fileManagerRouter({
        FileManagerService,
        config,
        permissions,
      }));
  }
}
