import { ObjectID as objectId } from 'mongodb';
import omit from 'lodash/omit';
import { generateCRUDRoutes } from 'na-crud';
import applyAccountToCRUDRoute
  from 'na-user/src/routes/account/handlers/applyAccountToCRUDRoute';
import findOne from 'na-crud/src/handlers/findOne';
import Boom from 'boom';
import loanApplicationSchema from '../../schemas/loanApplication';

const pathPrefix = '/applications';

const baseConfig = {
  auth: {
    strategy: 'jwt',
    scope: 'borrower',
  },
  tags: ['api'],
};

const crudRoutes = generateCRUDRoutes({
  pathPrefix,
  entityName: 'LoanApplication',
  schema: omit(loanApplicationSchema, ['accountId']),
});

Object.keys(crudRoutes).forEach(route => {
  crudRoutes[route] = {
    ...crudRoutes[route],
    config: {
      ...baseConfig,
      ...crudRoutes[route].config,
      pre: [
        ...crudRoutes[route].config.pre,
        { method: applyAccountToCRUDRoute(route) },
      ],
    },
  };
});

crudRoutes.deleteOne.config.pre.push(
  {
    method: findOne({
      entityName: 'LoanApplication',
      extractQuery: request => ({
        ...request.pre.query,
        accountId: objectId(request.auth.credentials.accountId),
      }),
    }),
    assign: 'loanApplication',
  },
  {
    method(request, reply) {
      const { loanApplication } = request.pre;

      if (loanApplication.status === 'open') {
        return reply(
          Boom.badRequest('Can\'t delete an open loanApplication.'),
        );
      }

      return reply();
    },
  },
);

export default [
  ...Object.keys(crudRoutes).reduce(
    (acc, route) => [...acc, crudRoutes[route]],
    [],
  ),
];
