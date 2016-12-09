import { generateCRUDServices } from 'octobus-mongodb';
import * as handlers from './handlers';
import schema from '../../schemas/auction';

const entityNamespace = 'entity.Auction';

export default ({
  dispatcher, db,
}) => {
  dispatcher.subscribeMap(entityNamespace,
    generateCRUDServices(dispatcher, entityNamespace, {
      db,
      schema,
    },
  ));

  const { subscribeMap } = dispatcher;
  subscribeMap(entityNamespace, handlers);
};
