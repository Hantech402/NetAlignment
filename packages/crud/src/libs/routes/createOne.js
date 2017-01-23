import { toBSON } from 'na-core';
import handler from '../../handlers/createOne';

export default ({ entityName, entityNs, path, schema, config = {} }) => ({
  path,
  method: 'POST',
  handler: handler({ entityName, entityNs }),
  config: {
    id: `${entityName}:createOne`,
    validate: {
      payload: schema,
    },
    description: `Add a new entity of type ${entityName}`,
    tags: ['api'],
    pre: [
      {
        method: (request, reply) => reply(toBSON(request.payload)),
        assign: 'payload',
      },
    ],
    ...config,
  },
});
