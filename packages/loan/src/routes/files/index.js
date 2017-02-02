import Joi from 'joi';
import { ObjectID as objectId } from 'mongodb';
import findOne from 'na-crud/src/handlers/findOne';
import { objectIdPattern } from 'na-core/src/constants';
import * as handlers from './handlers';

const pathPrefix = '/applications/{applicationId}';

const baseConfig = {
  auth: {
    strategy: 'jwt',
    scope: 'borrower',
  },
  pre: [
    {
      method: findOne({
        entityName: 'LoanApplication',
        extractQuery: (request) => ({
          _id: objectId(request.params.applicationId),
          accountId: objectId(request.auth.credentials.accountId),
        }),
      }),
      assign: 'loanApplication',
    },
  ],
  validate: {
    params: {
      applicationId: Joi.string(objectIdPattern).required(),
    },
  },
  tags: ['api'],
};

export default [{
  path: `${pathPrefix}/files`,
  method: 'GET',
  handler: handlers.findMany,
  config: {
    ...baseConfig,
    description: 'Retrieve loan application files',
  },
}, {
  path: `${pathPrefix}/files/archive`,
  method: 'GET',
  handler: handlers.getArchive,
  config: {
    ...baseConfig,
    description: 'Downloading an archive of all the files',
  },
}];
