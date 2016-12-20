import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';
import { toBSON } from '../libs/mongo-helpers';

export default ({
  entityName,
}) => async (request, reply) => {
  const accountId = objectId(request.auth.credentials.accountId);
  const { eventDispatcher: { dispatch }, query } = request;

  try {
    const dbQuery = {
      ...toBSON(query.query),
      accountId,
    };

    let cursor = await dispatch(`entity.${entityName}.findMany`, { query: dbQuery });

    if (query.offset !== undefined) {
      cursor = cursor.skip(parseInt(query.offset, 10));
    }

    if (query.limit !== undefined) {
      cursor = cursor.limit(parseInt(query.limit, 10));
    }

    const result = cursor.toArray();

    reply(result);
  } catch (err) {
    reply(Boom.wrap(err));
  }
};
