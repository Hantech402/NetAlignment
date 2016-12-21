import path from 'path';
import fs from 'fs';
import Joi from 'joi';
import objectIdValidator from 'na-core/src/schemas/objectId';
import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';
import * as crudHandlers from 'na-core/src/handlers';
import archiver from 'archiver';

const baseConfig = {
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
  validate: {
    params: {
      auctionId: objectIdValidator.required(),
    },
  },
  tags: ['api'],
};

export default [{
  path: '/{auctionId}/upload',
  method: 'POST',
  async handler(request, reply) {
    const { AuctionEntity } = this;
    const { auction } = request.pre;
    const uploadedFile = request.payload.file;

    try {
      const file = await AuctionEntity.addFile({
        auction,
        uploadedFile,
      });

      reply(file);
    } catch (err) {
      reply(Boom.wrap(err));
    }
  },
  config: {
    ...baseConfig,
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
      ...baseConfig.validate,
      payload: Joi.object().keys({
        file: Joi.any().required().meta({ swaggerType: 'file' }).description('file'),
      }).required(),
    },
    description: 'Uploading a file to an auction',
  },
}, {
  path: '/{auctionId}/files/{fileId}',
  method: 'GET',
  async handler(request, reply) {
    const { FileEntity } = this;
    const { fileId } = request.params;
    const { auction, file } = request.pre;

    try {
      const isValid = auction.fileIds.find((id) => id.toString() === fileId.toString());

      if (!isValid) {
        return reply(Boom.notFound(`Unable to find file with id ${fileId}`));
      }

      const filePath = await FileEntity.getPath(file);

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
    ...baseConfig,
    pre: [
      ...baseConfig.pre,
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
        auctionId: objectIdValidator.required(),
        fileId: objectIdValidator.required(),
      },
    },
    tags: ['api'],
  },
}, {
  path: '/{auctionId}/files/archive',
  method: 'GET',
  async handler(request, reply) {
    const { FileEntity } = this;
    const { auction } = request.pre;
    const { uploadDir } = request.server.settings.app;

    try {
      const archive = archiver('zip', {
        store: true,
      });

      archive.on('open', () => {
        reply(archive);
          // .header('Content-Disposition', `attachment; filename=archive.zip`);
      });

      const files = await FileEntity.findMany({
        query: {
          _id: {
            $in: auction.fileIds,
          },
        },
      }).then((c) => c.toArray());

      files.forEach((file) => {
        const filePath = path.join(uploadDir, `${file._id}${file.extension}`);
        archive.append(fs.createReadStream(filePath));
      });

      archive.finalize();
    } catch (err) {
      reply(Boom.wrap(err));
    }
  },
  config: {
    ...baseConfig,
    description: 'Downloading an archive of all the files',
  },
}, {
  path: '/{auctionId}/files/{fileId}',
  method: 'DELETE',
  async handler(request, reply) {
    const { AuctionEntity } = this;
    const { fileId } = request.params;
    const { auction, file } = request.pre;

    try {
      const isValid = auction.fileIds.find((id) => id.toString() === fileId.toString());

      if (!isValid) {
        return reply(Boom.notFound(`Unable to find file with id ${fileId}`));
      }

      await AuctionEntity.removeFile({
        auction,
        file,
      });

      return reply();
    } catch (err) {
      return reply(Boom.wrap(err));
    }
  },
  config: {
    ...baseConfig,
    pre: [
      ...baseConfig.pre,
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
        auctionId: objectIdValidator.required(),
        fileId: objectIdValidator.required(),
      },
    },
    description: 'Delete a file of an auction',
  },
}];
