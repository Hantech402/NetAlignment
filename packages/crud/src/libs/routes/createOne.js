import Boom from 'boom';
import { toBSON } from 'na-core';

export default (serviceNamespace, path, schema, config = {}) => ({
  path: path || '/',
  method: 'POST',
  async handler(request, reply) {
    const { eventDispatcher: { dispatch }, payload } = request;
    try {
      const parsedPayload = toBSON(payload);
      const result = await dispatch(`${serviceNamespace}.createOne`, parsedPayload);

      reply(result);
    } catch (err) {
      reply(Boom.wrap(err));
    }
  },
  config: {
    validate: {
      payload: schema,
    },
    description: 'Add a new entity',
    tags: ['api'],
    ...config,
  },
});
