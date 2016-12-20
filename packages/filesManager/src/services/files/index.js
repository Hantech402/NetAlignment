import { generateCRUDServices } from 'octobus-mongodb';
import schema from '../../schemas/file';
import * as handlers from './handlers';

const entityNamespace = 'entity.File';

export default ({
  dispatcher, db, refManager,
}) => {
  dispatcher.subscribeMap(entityNamespace, generateCRUDServices(dispatcher, entityNamespace, {
    db,
    schema,
    refManager,
  }));

  dispatcher.subscribeMap(entityNamespace, handlers);
};
