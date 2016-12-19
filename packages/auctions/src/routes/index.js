import { generateCRUDRoutes } from 'na-crud';
import auctionSchema from '../schemas/auction';

const generatedCRUDRoutes = generateCRUDRoutes('entity.Auction', auctionSchema);

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
    handler: generatedCRUDRoutes[route].handler,
  }])
), []);

const routes = [].concat(crudRoutes);

export default routes;
