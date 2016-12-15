import { generateCRUDServices } from 'octobus-mongodb';
import schema from '../../schemas/account';
import * as handlers from './handlers';

const entityNamespace = 'entity.Account';

export default ({
  dispatcher, db, refManager,
}) => {
  const { subscribeMap } = dispatcher;

  subscribeMap(entityNamespace, generateCRUDServices(dispatcher, entityNamespace, {
    db,
    schema,
    refManager,
  }));

  subscribeMap(entityNamespace, handlers);
};
