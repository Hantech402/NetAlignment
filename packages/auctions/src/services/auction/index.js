import { generateCRUDServices } from 'octobus-mongodb';
import * as handlers from './handlers';
import schema from '../../schemas/auction';

const entityNamespace = 'entity.Auction';

export default ({
  dispatcher, db, refManager,
}) => {
  dispatcher.subscribeMap(entityNamespace,
    generateCRUDServices(dispatcher, entityNamespace, {
      db,
      schema,
      refManager,
    },
  ));

  const { subscribeMap } = dispatcher;
  subscribeMap(entityNamespace, handlers);
};
