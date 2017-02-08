import Joi from 'joi';
import { ObjectID as objectId } from 'mongodb';
import findOne from 'na-crud/src/handlers/findOne';
import { objectIdPattern } from 'na-core/src/constants';
import * as handlers from './handlers';

const baseConfig = {
  auth: 'jwt',
  tags: ['api'],
};

const pres = {
  file: {
    method: findOne({
      entityName: 'File',
      extractQuery: (request) => ({
        _id: objectId(request.params.fileId),
        accountId: objectId(request.auth.credentials.accountId),
      }),
    }),
    assign: 'file',
  },
};

export default [{
  path: '/upload',
  method: 'POST',
  handler: handlers.upload,
  config: {
    ...baseConfig,
    pre: [{
      method(request, reply) {
        reply(request.payload.file);
      },
      assign: 'uploadedFile',
    }],
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
      payload: {
        file: Joi.any().required().meta({ swaggerType: 'file' }).description('file'),
      },
    },
    description: 'Upload a file',
  },
}, {
  path: '/{fileId}/download',
  method: 'GET',
  handler: handlers.download,
  config: {
    ...baseConfig,
    auth: 'bewit',
    pre: [{
      method: findOne({
        entityName: 'File',
        extractQuery: (request) => ({
          _id: objectId(request.params.fileId),
        }),
      }),
      assign: 'file',
    }],
    validate: {
      params: {
        fileId: Joi.string().regex(objectIdPattern).required(),
      },
    },
    description: 'Download a file',
  },
}, {
  path: '/archive',
  method: 'GET',
  handler: handlers.archive,
  config: {
    ...baseConfig,
    auth: 'bewit',
    description: 'Download an archive with all the files of an account',
  },
}, {
  path: '/{fileId}',
  method: 'DELETE',
  handler: handlers.remove,
  config: {
    ...baseConfig,
    pre: [pres.file],
    validate: {
      params: {
        fileId: Joi.string().regex(objectIdPattern).required(),
      },
    },
    description: 'Delete a file',
  },
}, {
  path: '/sign-url',
  method: 'POST',
  handler: handlers.signURL,
  config: {
    ...baseConfig,
    validate: {
      payload: {
        url: Joi.string().uri().required(),
      },
    },
    description: 'Sign a file download',
  },
}, {
  path: '/empty',
  method: 'POST',
  handler: handlers.empty,
  config: {
    ...baseConfig,
    description: 'Delete all the files from repository',
  },
}];
