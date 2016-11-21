import Joi from 'joi';
import { MongoClient } from 'mongodb';
import pkg from '../package.json';
import pluginOptionsSchema from './schemas/pluginOptions';

export function register(server, options, next) {
  const { mongoDb } = Joi.attempt(options, pluginOptionsSchema);

  MongoClient.connect(`mongodb://${mongoDb.host}:${mongoDb.port}/${mongoDb.db}`)
    .then((db) => {
      server.expose('mongoDb', db);
      next();
    })
    .catch(next);
}

register.attributes = {
  pkg,
  dependencies: [],
};
