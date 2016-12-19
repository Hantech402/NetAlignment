import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';
import { toBSON } from '../libs/mongo-helpers';

export default ({
  entityName,
}) => async (request, reply) => {
  const accountId = objectId(request.auth.credentials.accountId);
  const { eventDispatcher: { dispatch }, payload } = request;

  try {
    const parsedPayload = {
      ...toBSON(payload),
      accountId,
    };

    const result = await dispatch(`entity.${entityName}.createOne`, parsedPayload);

    reply(result);
  } catch (err) {
    reply(Boom.wrap(err));
  }
};
