import { generateCRUDServices } from 'octobus-mongodb';
import * as handlers from './handlers';

const entityNamespace = 'entity.Action';

export default (
  {
    dispatcher,
    db,
    refManager,
    actionSchema,
  },
) => {
  const { subscribeMap } = dispatcher;

  subscribeMap(
    entityNamespace,
    generateCRUDServices(dispatcher, entityNamespace, {
      db,
      schema: actionSchema,
      refManager,
    }),
  );

  subscribeMap(entityNamespace, handlers);
};
