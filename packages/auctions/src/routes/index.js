import path from 'path';
import fs from 'fs';
import Joi from 'joi';
import { generateCRUDRoutes } from 'na-crud';
import * as crudHandlers from 'na-core/src/handlers';
import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';
import auctionSchema from '../schemas/auction';

const generatedCRUDRoutes = generateCRUDRoutes({
  serviceNamespace: 'entity.Auction',
  schema: auctionSchema,
});

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

const routes = [{
  path: '/{auctionId}/upload',
  method: 'POST',
  async handler(request, reply) {
    const { FileEntity, AuctionEntity } = this;
    const { auction } = request.pre;
    const { uploadDir } = request.server.settings.app;
    const uploadedFile = request.payload.file;

    const filename = path.basename(uploadedFile.filename);
    const extension = path.extname(uploadedFile.filename);
    const uploadPath = uploadedFile.path;

    try {
      const file = await FileEntity.createOne({
        accountId: auction.accountId,
        filename,
        size: uploadedFile.bytes,
        contentType: uploadedFile.headers['content-type'],
        extension,
      });

      await AuctionEntity.updateOne({
        query: {
          _id: auction._id,
        },
        update: {
          $push: {
            fileIds: file._id,
          },
        },
      });

      const destination = path.join(uploadDir, `${file._id}${extension}`);

      fs.rename(uploadPath, destination, (err) => {
        if (err) {
          return reply(Boom.wrap(err));
        }

        return reply(file);
      });
    } catch (err) {
      reply(Boom.wrap(err));
    }
  },
  config: {
    auth: {
      strategy: 'jwt',
      scope: 'borrower',
    },
    pre: [
      {
        method: crudHandlers.findById({
          entityName: 'Auction',
          extractId: (request) => objectId(request.params.auctionId),
        }),
        assign: 'auction',
      },
    ],
    payload: {
      output: 'file',
      parse: true,
    },
    plugins: {
      'hapi-swagger': {
        payloadType: 'form',
      },
    },
    validate: {
      payload: Joi.object().keys({
        file: Joi.any().required().meta({ swaggerType: 'file' }).description('file'),
      }).required(),
      params: {
        auctionId: Joi.string().required(),
      },
    },
    tags: ['api'],
  },
}, {
  path: '/{auctionId}/files/{fileId}',
  method: 'GET',
  async handler(request, reply) {
    const { fileId } = request.params;
    const { auction, file } = request.pre;
    const { uploadDir } = request.server.settings.app;

    try {
      const isValid = auction.fileIds.find((id) => id.toString() === fileId.toString());

      if (!isValid) {
        return reply(Boom.notFound(`Unable to find file with id ${fileId}`));
      }

      const filePath = path.join(uploadDir, `${file._id}${file.extension}`);

      return fs.readFile(filePath, (err, fileContent) => {
        if (err) {
          return reply(Boom.wrap(err));
        }

        return reply(fileContent)
          .header('Content-Type', file.contentType)
          .header('Content-Disposition', `attachment; filename=${file.filename}`);
      });
    } catch (err) {
      return reply(Boom.wrap(err));
    }
  },
  config: {
    auth: {
      strategy: 'jwt',
      scope: 'borrower',
    },
    pre: [
      {
        method: crudHandlers.findById({
          entityName: 'Auction',
          extractId: (request) => objectId(request.params.auctionId),
        }),
        assign: 'auction',
      },
      {
        method: crudHandlers.findById({
          entityName: 'File',
          extractId: (request) => objectId(request.params.fileId),
        }),
        assign: 'file',
      },
    ],
    validate: {
      params: {
        auctionId: Joi.string().required(),
        fileId: Joi.string().required(),
      },
    },
    tags: ['api'],
  },
}];

export default routes.concat(crudRoutes);
