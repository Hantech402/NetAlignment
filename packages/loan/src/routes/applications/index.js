import omit from 'lodash/omit';
import { generateCRUDRoutes } from 'na-crud';
import applyAccountToCRUDRoute from 'na-user/src/routes/account/handlers/applyAccountToCRUDRoute';
import Boom from 'boom';
import loanApplicationSchema from '../../schemas/loanApplication';
import findApplication from './handlers/findApplication';

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

Object.keys(crudRoutes).forEach((route) => {
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
    method: findApplication,
    assign: 'loanApplication',
  },
  {
    method(request, reply) {
      const { loanApplication } = request.pre;

      if (!['draft'].includes(loanApplication.status)) {
        return reply(Boom.badRequest(`Can't delete a ${loanApplication.status} loanApplication.`));
      }

      return reply();
    },
  },
);

export default [
  ...Object.keys(crudRoutes).reduce((acc, route) => [...acc, crudRoutes[route]], []),
];
