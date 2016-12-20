import path from 'path';
import fs from 'fs';
import Joi from 'joi';

export default [{
  path: '/upload',
  method: 'POST',
  handler(request, reply) {
    const uploadName = path.basename(request.payload.file.filename);
    const uploadPath = request.payload.file.path;
    const destination = path.join(request.server.settings.app.uploadDir, uploadName);

    fs.rename(uploadPath, destination, reply);
  },
  config: {
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
        file: Joi.any().meta({ swaggerType: 'file' }).description('file'),
      },
    },
    tags: ['api'],
  },
}];
