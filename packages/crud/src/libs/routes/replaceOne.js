import Joi from 'joi';
import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';
import { toBSON } from 'na-core';

export default (serviceNamespace, path, schema, config = {}) => ({
  path,
  method: 'PUT',
  async handler(request, reply) {
    const { eventDispatcher: { dispatch } } = request;
    const { id } = request.params;

    try {
      const parsedPayload = toBSON(request.payload);
      const entity = await dispatch(`${serviceNamespace}.findById`, objectId(id));

      if (!entity) {
        reply(Boom.notFound(`Unable to find entity with id ${id}`));
      }

      const result = await dispatch(`${serviceNamespace}.replaceOne`, {
        _id: objectId(id),
        createdAt: entity.createdAt,
        ...parsedPayload,
      });

      reply(result);
    } catch (err) {
      reply(Boom.wrap(err));
    }
  },
  config: {
    validate: {
      params: {
        id: Joi.string().required(),
      },
      payload: schema,
    },
    description: 'Replace an entity',
    tags: ['api'],
    ...config,
  },
});
