import Joi from 'joi';
import pkg from '../package.json';
import setupServices from './services';
import pluginOptionsSchema from './schemas/pluginOptions';
import actionSchemaFactory from './schemas/action';

export function register(server, options, next) {
  const pluginOptions = Joi.attempt(options, pluginOptionsSchema);
  const dispatcher = server.plugins['hapi-octobus'].eventDispatcher;
  const { mongoDb: db, refManager } = server.plugins['na-storage'];

  const actionSchema = actionSchemaFactory(pluginOptions);

  setupServices({
    dispatcher,
    db,
    refManager,
    actionSchema,
  });

  // server.route(routes);

  next();
}

register.attributes = {
  pkg,
  dependencies: ['na-crud'],
};
