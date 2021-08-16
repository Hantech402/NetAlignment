import applyContextToCRUDRoute from 'na-crud/src/libs/applyContextToCRUDRoute';
import { ObjectID as objectId } from 'mongodb';

export default (route) => applyContextToCRUDRoute(
  route,
  (request) => ({
    accountId: objectId(request.auth.credentials.accountId),
  }),
);
