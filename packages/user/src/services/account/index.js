import { generateCRUDServices } from 'octobus-mongodb';
import schema from '../../schemas/account';
import * as handlers from './handlers';

const entityNamespace = 'entity.Account';

export default ({
  dispatcher, db, refManager, app,
}) => {
  const { subscribeMap, onAfter } = dispatcher;

  subscribeMap(entityNamespace, generateCRUDServices(dispatcher, entityNamespace, {
    db,
    schema,
    refManager,
  }));

  subscribeMap(entityNamespace, handlers);

  onAfter('entity.Account.createOne', handlers.createUploadDir(app));
};
