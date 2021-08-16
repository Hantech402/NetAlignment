import findById from 'na-crud/src/handlers/findById';
import { ObjectID as objectId } from 'mongodb';

export default findById({
  entityName: 'LoanApplication',
  extractId: (request) => objectId(request.params.id),
  extractQuery: (request) => ({
    _id: objectId(request.params.id),
    accountId: objectId(request.auth.credentials.accountId),
  }),
});
