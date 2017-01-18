import { generateCRUDRoutes } from 'na-crud';
import * as crudHandlers from 'na-core/src/handlers';
import { toBSON } from 'na-core';
import Boom from 'boom';
import loanApplicationSchema from '../schemas/loanApplication';
import filesRoutes from './files';
// import { ObjectID as objectId } from 'mongodb';

const generatedCRUDRoutes = generateCRUDRoutes({
  pathPrefix: '/applications',
  serviceNamespace: 'entity.LoanApplication',
  schema: loanApplicationSchema,
});

generatedCRUDRoutes.deleteOne.config.pre = [
  {
    async method(request, reply) {
      const { LoanApplicationEntity } = this;
      const loanApplication = await LoanApplicationEntity.findOne({
        query: toBSON(request.payload.query),
      });

      if (!loanApplication) {
        return reply(Boom.notFound('Unable to find entity.'));
      }

      if (!['draft'].includes(loanApplication.status)) {
        return reply(Boom.badRequest(`Can't delete a ${loanApplication.status} loanApplication.`));
      }

      return reply(loanApplication);
    },
    assign: 'loanApplication',
  },
  ...(generatedCRUDRoutes.deleteOne.config.pre || []),
];

generatedCRUDRoutes.updateOne.config.pre = [
  {
    async method(request, reply) {
      const { LoanApplicationEntity } = this;
      const loanApplication = await LoanApplicationEntity.findOne({
        query: toBSON(request.payload.query),
      });

      if (!loanApplication) {
        return reply(Boom.notFound('Unable to find entity.'));
      }

      if (!['draft'].includes(loanApplication.status)) {
        return reply(Boom.badRequest(`Can't delete a ${loanApplication.status} loanApplication.`));
      }

      return reply(loanApplication);
    },
    assign: 'loanApplication',
  },
  ...(generatedCRUDRoutes.deleteOne.config.pre || []),
];

const crudRoutes = [
  'count', 'createOne', 'deleteOne', 'findById', 'findMany', 'findOne', 'replaceOne', 'updateOne',
].reduce((acc, route) => (
  acc.concat([{
    ...generatedCRUDRoutes[route],
    config: {
      ...generatedCRUDRoutes[route].config,
      auth: {
        strategy: 'jwt',
        scope: 'borrower',
      },
    },
    handler: crudHandlers[route]({
      entityName: 'LoanApplication',
    }),
  }])
), []);

const routes = [];

export default routes.concat(crudRoutes, filesRoutes);
