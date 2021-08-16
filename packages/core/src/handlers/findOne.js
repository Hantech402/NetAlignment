import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';
import { toBSON } from '../libs/mongo-helpers';

export default ({
  entityName,
}) => async (request, reply) => {
  const { eventDispatcher: { dispatch } } = request;
  const accountId = objectId(request.auth.credentials.accountId);

  try {
    const query = {
      ...toBSON(request.query),
      accountId,
    };

    const entity = await dispatch(`entity.${entityName}.findOne`, { query });

    if (!entity) {
      return reply(Boom.notFound('Unable to find entity.'));
    }

    return reply(entity);
  } catch (err) {
    return reply(Boom.wrap(err));
  }
};
