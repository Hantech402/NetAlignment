import { generateCRUDServices } from 'octobus-mongodb';
import path from 'path';
import schema from '../../schemas/file';
import * as handlers from './handlers';

const entityNamespace = 'entity.File';

export default ({
  dispatcher, db, refManager, uploadDir,
}) => {
  const { subscribeMap, subscribe } = dispatcher;

  subscribeMap(entityNamespace, generateCRUDServices(dispatcher, entityNamespace, {
    db,
    schema,
    refManager,
  }));

  subscribeMap(entityNamespace, handlers);

  subscribe(
    'entity.File.getPath',
    ({ params: file }) => path.join(uploadDir, `${file.accountId}/${file._id}${file.extension}`),
  );
};
