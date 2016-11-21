import Joi from 'joi';
import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';
import { toBSON } from 'na-core';

export default (serviceNamespace, path, config = {}) => ({
  path,
  method: 'PATCH',
  async handler(request, reply) {
    const { eventDispatcher: { dispatch }, params } = request;
    const { id } = params;

    try {
      const parsedPayload = toBSON(request.payload);
      const entity = await dispatch(`${serviceNamespace}.findById`, objectId(id));
      if (!entity) {
        reply(Boom.notFound(`Unable to find entity with id ${id}`));
      }

      const result = await dispatch(`${serviceNamespace}.updateOne`, {
        query: {
          _id: objectId(id),
        },
        update: {
          $set: parsedPayload,
        },
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
      payload: Joi.object().required(),
    },
    description: 'Update an entity',
    tags: ['api'],
    ...config,
  },
});
