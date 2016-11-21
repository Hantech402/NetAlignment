import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';
import { toBSON } from '../libs/mongo-helpers';

export default ({
  entityName,
}) => async (request, reply) => {
  const accountId = objectId(request.auth.credentials.accountId);
  const { eventDispatcher, query } = request;

  try {
    const parsedQuery = toBSON(query);
    const result = await eventDispatcher.dispatch(`entity.${entityName}.deleteOne`, {
      query: parsedQuery,
      accountId,
    });

    reply(result);
  } catch (err) {
    reply(Boom.wrap(err));
  }
};
