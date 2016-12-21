import { generateCRUDRoutes } from 'na-crud';
import * as crudHandlers from 'na-core/src/handlers';
import auctionSchema from '../schemas/auction';
import filesRoutes from './files';
// import { ObjectID as objectId } from 'mongodb';

const generatedCRUDRoutes = generateCRUDRoutes({
  serviceNamespace: 'entity.Auction',
  schema: auctionSchema,
});

// generatedCRUDRoutes.updateOne.config.pre = [
//   ...(generatedCRUDRoutes.updateOne.config.pre || []),
//   {
//     async method(request, reply) {
//       const auction = await this.AuctionEntity.findById(objectId(request.params.id));
//     },
//     assign: 'entity',
//   },
// ];

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
      entityName: 'Auction',
    }),
  }])
), []);

const routes = [];

export default routes.concat(crudRoutes, filesRoutes);
