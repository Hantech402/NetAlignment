import { toBSON } from 'na-core';
import Joi from 'joi';
import handler from '../../handlers/findOne';

export default ({ entityName, entityNs, path, config = {} }) => ({
  path,
  method: 'GET',
  handler: handler({ entityName, entityNs }),
  config: {
    id: `${entityName}:findOne`,
    validate: {
      query: Joi.object().keys({
        query: Joi.object().default({}),
      }).default({}),
    },
    description: `Find a single entity of type ${entityName}`,
    tags: ['api'],
    pre: [
      {
        method: (request, reply) => reply(toBSON(request.query.query)),
        assign: 'query',
      },
    ],
    ...config,
  },
});
