import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';

const extractIdHandler = (request) => request.params.id;

export default ({
  entityName,
  extractId = extractIdHandler,
}) => async (request, reply) => {
  const { eventDispatcher: { dispatch } } = request;
  const { accountId } = request.auth.credentials;
  const id = extractId(request);

  try {
    const entity = await dispatch(`entity.${entityName}.findOne`, {
      query: {
        _id: objectId(id),
        accountId: objectId(accountId),
      },
    });

    if (entity) {
      reply(entity);
    } else {
      reply(Boom.notFound(`Unable to find entity with id ${id}`));
    }
  } catch (err) {
    reply(Boom.wrap(err));
  }
};
