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
        entityName: 'LoanApplication',
        extractId: (request) => objectId(request.params.loanApplicationId),
      }),
      assign: 'loanApplication',
    },
  ],
  validate: {
    params: {
      loanApplicationId: objectIdValidator.required(),
    },
  },
  tags: ['api'],
};

export default [{
  path: '/{loanApplicationId}/upload',
  method: 'POST',
  async handler(request, reply) {
    const { LoanApplicationEntity } = this;
    const { loanApplication } = request.pre;
    const uploadedFile = request.payload.file;

    try {
      const file = await LoanApplicationEntity.addFile({
        loanApplication,
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
    description: 'Uploading a file to a loan application',
  },
}, {
  path: '/{loanApplicationId}/files/{fileId}',
  method: 'GET',
  async handler(request, reply) {
    const { FileEntity } = this;
    const { fileId } = request.params;
    const { loanApplication, file } = request.pre;

    try {
      const isValid = loanApplication.fileIds.find((id) => id.toString() === fileId.toString());

      if (!isValid) {
        return reply(Boom.notFound(`Unable to find file with id ${fileId}`));
      }

      const filePath = await FileEntity.getPath(file);

      return reply.file(filePath, {
        confine: false,
        filename: file.filename,
        mode: 'attachment',
      });

      // return fs.readFile(filePath, (err, fileContent) => {
      //   if (err) {
      //     return reply(Boom.wrap(err));
      //   }
      //
      //   return reply(fileContent)
      //     .header('Content-Type', file.contentType)
      //     .header('Content-Disposition', `attachment; filename=${file.filename}`);
      // });
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
        loanApplicationId: objectIdValidator.required(),
        fileId: objectIdValidator.required(),
      },
    },
    tags: ['api'],
  },
}, {
  path: '/{loanApplicationId}/files/archive',
  method: 'GET',
  async handler(request, reply) {
    const { FileEntity } = this;
    const { loanApplication } = request.pre;
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
            $in: loanApplication.fileIds,
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
  path: '/{loanApplicationId}/files/{fileId}',
  method: 'DELETE',
  async handler(request, reply) {
    const { LoanApplicationEntity } = this;
    const { fileId } = request.params;
    const { loanApplication, file } = request.pre;

    try {
      const isValid = loanApplication.fileIds.find((id) => id.toString() === fileId.toString());

      if (!isValid) {
        return reply(Boom.notFound(`Unable to find file with id ${fileId}`));
      }

      await LoanApplicationEntity.removeFile({
        loanApplication,
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
        loanApplicationId: objectIdValidator.required(),
        fileId: objectIdValidator.required(),
      },
    },
    description: 'Delete a file of an loanApplication',
  },
}];
