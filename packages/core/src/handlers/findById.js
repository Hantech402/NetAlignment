import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';

const extractIdHandler = (request) => objectId(request.params.id);

export default ({
  entityName,
  extractId = extractIdHandler,
}) => async (request, reply) => {
  const accountId = objectId(request.auth.credentials.accountId);
  const { eventDispatcher: { dispatch } } = request;
  const id = extractId(request);

  try {
    const entity = await dispatch(`entity.${entityName}.findById`, id);

    if (
      !entity ||
      (entity.accountId.toString() !== accountId.toString())
    ) {
      return reply(Boom.notFound(`Unable to find entity with id ${id}`));
    }

    return reply(entity);
  } catch (err) {
    return reply(Boom.wrap(err));
  }
};
