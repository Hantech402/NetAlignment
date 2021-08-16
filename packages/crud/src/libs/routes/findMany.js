import { toBSON } from 'na-core';
import Joi from 'joi';
import pick from 'lodash/pick';
import handler from '../../handlers/findMany';

export default ({ entityName, entityNs, path, config = {} }) => ({
  path,
  method: 'GET',
  handler: handler({ entityName, entityNs }),
  config: {
    id: `${entityName}:findMany`,
    validate: {
      query: {
        query: Joi.object().default({}),
        offset: Joi.number(),
        limit: Joi.number(),
        orderBy: Joi.object().default({}),
        fields: Joi.object().default({}),
      },
    },
    description: `Find all entities of type ${entityName}`,
    tags: ['api'],
    pre: [
      {
        method: (request, reply) => {
          const { query } = request;
          const params = pick(query, ['fields', 'orderBy']);
          params.query = toBSON(query.query);

          if (query.offset !== undefined) {
            params.skip = parseInt(query.offset, 10);
          }

          if (query.limit !== undefined) {
            params.limit = parseInt(query.limit, 10);
          }

          reply(params);
        },
        assign: 'queryParams',
      },
    ],
    ...config,
  },
});