import { generateCRUDServices } from 'octobus-mongodb';
import schema from '../../schemas/message';
import * as handlers from './handlers';

const entityNamespace = 'entity.Message';

export default ({
  dispatcher, db,
}) => {
  dispatcher.subscribeMap(entityNamespace, generateCRUDServices(dispatcher, entityNamespace, {
    db,
    schema,
  }));

  dispatcher.subscribeMap(entityNamespace, handlers);
};
