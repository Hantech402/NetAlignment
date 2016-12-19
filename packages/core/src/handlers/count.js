import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';
import { toBSON } from '../libs/mongo-helpers';

export default ({
  entityName,
}) => async (request, reply) => {
  const { eventDispatcher: { dispatch } } = request;
  const accountId = objectId(request.auth.credentials.accountId);
  const { query } = request.query;

  try {
    const parsedQuery = {
      ...toBSON(query),
      accountId,
    };

    const count = await dispatch(`entity.${entityName}.count`, { query: parsedQuery });

    reply(count);
  } catch (err) {
    reply(Boom.wrap(err));
  }
};
