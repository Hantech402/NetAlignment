import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';
import objectIdValidator from 'na-core/src/schemas/objectId';

export default (serviceNamespace, path, config = {}) => ({
  path,
  method: 'GET',
  async handler(request, reply) {
    const { eventDispatcher: { dispatch } } = request;
    const { id } = request.params;

    try {
      const entity = await dispatch(`${serviceNamespace}.findById`, objectId(id));

      if (entity) {
        reply(entity);
      } else {
        reply(Boom.notFound(`Unable to find entity with id ${id}`));
      }
    } catch (err) {
      reply(Boom.wrap(err));
    }
  },
  config: {
    validate: {
      params: {
        id: objectIdValidator.required(),
      },
    },
    description: 'Get an entity by id',
    tags: ['api'],
    ...config,
  },
});
