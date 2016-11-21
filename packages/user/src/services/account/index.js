import { generateCRUDServices } from 'octobus-mongodb';
import schema from '../../schemas/account';
import * as handlers from './handlers';

const entityNamespace = 'entity.Account';

export default ({
  dispatcher, db,
}) => {
  const { subscribeMap } = dispatcher;

  subscribeMap(entityNamespace, generateCRUDServices(dispatcher, entityNamespace, {
    db,
    schema,
  }));

  subscribeMap(entityNamespace, handlers);
};
