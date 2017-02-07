import Joi from 'joi';
import { ObjectID as objectId } from 'mongodb';
import findOne from 'na-crud/src/handlers/findOne';
import { objectIdPattern } from 'na-core/src/constants';
import * as handlers from './handlers';

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
    auth: 'jwt',
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
    tags: ['api'],
  },
}, {
  path: '/{fileId}/download',
  method: 'GET',
  handler: handlers.download,
  config: {
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
    tags: ['api'],
    description: 'Download a file',
  },
}, {
  path: '/{fileId}',
  method: 'DELETE',
  handler: handlers.remove,
  config: {
    auth: 'jwt',
    pre: [pres.file],
    validate: {
      params: {
        fileId: Joi.string().regex(objectIdPattern).required(),
      },
    },
    tags: ['api'],
    description: 'Delete a file',
  },
}, {
  path: '/sign-url',
  method: 'POST',
  handler: handlers.signURL,
  config: {
    auth: 'jwt',
    validate: {
      payload: {
        url: Joi.string().uri().required(),
      },
    },
    tags: ['api'],
    description: 'Sign a file download',
  },
}];
