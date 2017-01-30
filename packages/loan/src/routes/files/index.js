import path from 'path';
import fs from 'fs';
import Joi from 'joi';
import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';
import findOne from 'na-crud/src/handlers/findOne';
import findById from 'na-crud/src/handlers/findById';
import archiver from 'archiver';
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
  path: `${pathPrefix}/upload`,
  method: 'POST',
  handler: handlers.upload,
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
  path: `${pathPrefix}/files/{fileId}`,
  method: 'GET',
  handler: handlers.download,
  config: {
    ...baseConfig,
    pre: [
      ...baseConfig.pre,
      {
        method: findById({
          entityName: 'File',
          extractId: (request) => objectId(request.params.fileId),
        }),
        assign: 'file',
      },
    ],
    validate: {
      params: {
        applicationId: Joi.string(objectIdPattern).required(),
        fileId: Joi.string(objectIdPattern).required(),
      },
    },
    tags: ['api'],
  },
}, {
  path: `${pathPrefix}/files/archive`,
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
  path: `${pathPrefix}/files/{fileId}`,
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
        method: findById({
          entityName: 'File',
          extractId: (request) => objectId(request.params.fileId),
        }),
        assign: 'file',
      },
    ],
    validate: {
      params: {
        applicationId: Joi.string(objectIdPattern).required(),
        fileId: Joi.string(objectIdPattern).required(),
      },
    },
    description: 'Delete a file of an loanApplication',
  },
}];
