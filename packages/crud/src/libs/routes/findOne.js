import Boom from 'boom';
import { toBSON } from 'na-core';

export default (serviceNamespace, path, config = {}) => ({
  path,
  method: 'GET',
  async handler(request, reply) {
    const { eventDispatcher: { dispatch } } = request;

    try {
      const parsedQuery = toBSON(request.query);
      const entity = await dispatch(`${serviceNamespace}.findOne`, parsedQuery);

      if (!entity) {
        return reply(Boom.notFound('Unable to find entity.'));
      }

      return reply(entity);
    } catch (err) {
      return Boom.wrap(err);
    }
  },
  config: {
    validate: {
      query: {
      },
    },
    description: 'Find a single entity',
    tags: ['api'],
    ...config,
  },
});
