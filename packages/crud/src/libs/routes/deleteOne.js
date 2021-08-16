import Joi from 'joi';
import { toBSON } from 'na-core';
import handler from '../../handlers/deleteOne';

export default ({ entityName, entityNs, path, config = {} }) => ({
  path,
  method: 'DELETE',
  handler: handler({ entityName, entityNs }),
  config: {
    id: `${entityName}:deleteOne`,
    validate: {
      payload: Joi.object().keys({
        query: Joi.object().required(),
      }).required(),
    },
    description: `Delete an entity of type ${entityName}`,
    tags: ['api'],
    pre: [
      {
        method: (request, reply) => reply(toBSON(request.payload.query)),
        assign: 'query',
      },
    ],
    ...config,
  },
});
