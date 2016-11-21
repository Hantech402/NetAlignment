import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';
import omit from 'lodash/omit';
import { toBSON } from '../libs/mongo-helpers';

export default ({
  entityName,
}) => async (request, reply) => {
  const accountId = objectId(request.auth.credentials.accountId);
  const { eventDispatcher: { dispatch }, params } = request;
  const { id } = params;

  try {
    const parsedPayload = omit(toBSON(request.payload), ['accountId']);
    const entity = await dispatch(`entity.${entityName}.findOne`, {
      query: {
        _id: objectId(id),
        accountId,
      },
    });

    if (!entity) {
      reply(Boom.notFound(`Unable to find entity with id ${id}`));
    }

    const result = await dispatch(`entity.${entityName}.updateOne`, {
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
};
