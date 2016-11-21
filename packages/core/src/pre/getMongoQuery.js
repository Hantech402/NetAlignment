import { ObjectID as objectId } from 'mongodb';
import { toBSON } from '../libs/mongo-helpers';

export default (request, reply) => {
  reply({
    ...toBSON(request.query.query),
    accountId: objectId(request.auth.credentials.accountId),
  });
};
