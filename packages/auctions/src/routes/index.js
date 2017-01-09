import { generateCRUDRoutes } from 'na-crud';
import * as crudHandlers from 'na-core/src/handlers';
import { toBSON } from 'na-core';
import Boom from 'boom';
import auctionSchema from '../schemas/auction';
import filesRoutes from './files';
// import { ObjectID as objectId } from 'mongodb';

const generatedCRUDRoutes = generateCRUDRoutes({
  serviceNamespace: 'entity.Auction',
  schema: auctionSchema,
});

generatedCRUDRoutes.deleteOne.config.pre = [
  {
    async method(request, reply) {
      const { AuctionEntity } = this;
      const auction = await AuctionEntity.findOne({
        query: toBSON(request.payload.query),
      });

      if (!auction) {
        return reply(Boom.notFound('Unable to find entity.'));
      }

      if (!['draft'].includes(auction.status)) {
        return reply(Boom.badRequest(`Can't delete a ${auction.status} auction.`));
      }

      return reply(auction);
    },
    assign: 'auction',
  },
  ...(generatedCRUDRoutes.deleteOne.config.pre || []),
];

generatedCRUDRoutes.updateOne.config.pre = [
  {
    async method(request, reply) {
      const { AuctionEntity } = this;
      const auction = await AuctionEntity.findOne({
        query: toBSON(request.payload.query),
      });

      if (!auction) {
        return reply(Boom.notFound('Unable to find entity.'));
      }

      if (!['draft'].includes(auction.status)) {
        return reply(Boom.badRequest(`Can't delete a ${auction.status} auction.`));
      }

      return reply(auction);
    },
    assign: 'auction',
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
      entityName: 'Auction',
    }),
  }])
), []);

const routes = [];

export default routes.concat(crudRoutes, filesRoutes);
