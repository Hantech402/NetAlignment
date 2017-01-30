import omit from 'lodash/omit';
import { generateCRUDServices } from 'octobus-mongodb';
import schema from '../../schemas/file';
import * as handlers from './handlers';

const entityNamespace = 'entity.File';

export default ({
  dispatcher, db, refManager, uploadDir,
}) => {
  const { subscribeMap } = dispatcher;

  subscribeMap(entityNamespace, generateCRUDServices(dispatcher, entityNamespace, {
    db,
    schema,
    refManager,
  }));

  subscribeMap(entityNamespace, {
    ...omit(handlers, ['getPath']),
    getPath: handlers.getPath(uploadDir),
  });
};
