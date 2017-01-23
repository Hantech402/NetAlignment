import Boom from 'boom';
import { toBSON } from 'na-core';
import Joi from 'joi';

export default (serviceNamespace, path, config = {}) => ({
  path,
  method: 'GET',
  async handler(request, reply) {
    const { eventDispatcher: { dispatch } } = request;
    const { query } = request.query;

    try {
      const parsedQuery = toBSON(query);
      const count = await dispatch(
        `${serviceNamespace}.count`, { query: parsedQuery },
      );

      reply(count);
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
    description: 'Count entities',
    tags: ['api'],
    ...config,
  },
});
