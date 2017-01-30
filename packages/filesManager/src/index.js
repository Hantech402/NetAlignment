import Joi from 'joi';
import Inert from 'inert';
import pkg from '../package.json';
import setupServices from './services';
import pluginOptionsSchema from './schemas/pluginOptions';
import routes from './routes';

export function register(server, options, next) {
  const pluginOptions = Joi.attempt(options, pluginOptionsSchema);
  const dispatcher = server.plugins['hapi-octobus'].eventDispatcher;
  const { dispatch, lookup } = dispatcher;
  const { mongoDb: db, refManager } = server.plugins['na-storage'];
  const { uploadDir } = pluginOptions;

  server.register([
    Inert,
  ]).then(() => {
    setupServices({
      dispatcher,
      db,
      refManager,
      uploadDir,
    });

    const FileEntity = lookup('entity.File');

    server.expose('FileEntity', FileEntity);

    server.bind({
      dispatch,
      lookup,
      FileEntity,
    });

    server.route(routes);

    next();
  }, next);
}

register.attributes = {
  pkg,
  dependencies: ['na-crud'],
};
