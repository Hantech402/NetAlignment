import Joi from 'joi';
import Boom from 'boom';
import { toBSON } from 'na-core';

export default (serviceNamespace, path, config = {}) => ({
  path,
  method: 'DELETE',
  async handler(request, reply) {
    const { eventDispatcher: { dispatch }, query } = request;

    try {
      const parsedQuery = toBSON(query);
      const result = await dispatch(
        `${serviceNamespace}.deleteOne`, { query: parsedQuery },
      );

      reply(result);
    } catch (err) {
      reply(Boom.wrap(err));
    }
  },
  config: {
    validate: {
      query: Joi.object().required(),
    },
    description: 'Delete an entity',
    tags: ['api'],
    ...config,
  },
});
