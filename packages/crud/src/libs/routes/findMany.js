import Boom from 'boom';
import { toBSON } from 'na-core';
import Joi from 'joi';

export default (serviceNamespace, path, config = {}) => ({
  path,
  method: 'GET',
  async handler(request, reply) {
    const { eventDispatcher: { dispatch }, query } = request;

    try {
      let cursor = await dispatch(`${serviceNamespace}.findMany`, {
        query: toBSON(query.query),
      });

      if (query.offset !== undefined) {
        cursor = cursor.skip(parseInt(query.offset, 10));
      }

      if (query.limit !== undefined) {
        cursor = cursor.limit(parseInt(query.limit, 10));
      }

      const result = cursor.toArray();

      reply(result);
    } catch (err) {
      reply(Boom.wrap(err));
    }
  },
  config: {
    validate: {
      query: {
        query: Joi.object().default({}),
      },
    },
    description: 'Find all entities',
    tags: ['api'],
    ...config,
  },
});
