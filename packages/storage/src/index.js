import pkg from '../package.json';
import StorageRouter from './routers/Storage';

export function register(server, options, next) {
  const FileRepository = server.plugins['makeen-storage'].File.extract(
    'FileRepository',
  );

  const storageRouter = new StorageRouter(FileRepository);

  storageRouter.mount(server);

  // extend by register makeen-storage

  next();
}

register.attributes = {
  pkg,
  dependencies: ['makeen-core', 'makeen-storage'],
};
