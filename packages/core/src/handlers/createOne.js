import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';
import { toBSON } from '../libs/mongo-helpers';

export default ({
  entityName,
}) => async (request, reply) => {
  const { accountId } = request.auth.credentials;
  const { eventDispatcher: { dispatch }, payload } = request;

  try {
    const parsedPayload = toBSON(payload);
    parsedPayload.accountId = objectId(accountId);
    const result = await dispatch(`entity.${entityName}.createOne`, parsedPayload);

    reply(result);
  } catch (err) {
    reply(Boom.wrap(err));
  }
};
