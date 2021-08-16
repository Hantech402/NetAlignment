import omit from 'lodash/omit';
import { generateCRUDServices } from 'octobus-mongodb';
import schema from '../../schemas/account';
import * as handlers from './handlers';

const entityNamespace = 'entity.Account';

export default ({
  dispatcher, db, refManager, app,
}) => {
  const { subscribeMap } = dispatcher;

  subscribeMap(entityNamespace, generateCRUDServices(dispatcher, entityNamespace, {
    db,
    schema,
    refManager,
  }));

  subscribeMap(entityNamespace, {
    ...omit(handlers, ['getUploadDir']),
    getUploadDir: handlers.getUploadDir(app.uploadDir),
  });
};
