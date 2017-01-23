import { toBSON } from 'na-core';
import Joi from 'joi';
import handler from '../../handlers/count';

export default ({ entityName, entityNs, path, config = {} }) => ({
  path,
  method: 'GET',
  handler: handler({ entityName, entityNs }),
  config: {
    id: `${entityName}:count`,
    validate: {
      query: {
        query: Joi.object().default({}),
      },
    },
    description: `Count entities of type ${entityName}`,
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
