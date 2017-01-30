import fs from 'fs-promise';
import { decorators, applyDecorators } from 'octobus.js';
import { ObjectID as objectId } from 'mongodb';

const { withLookups, withHandler } = decorators;

export default applyDecorators([
  withLookups({
    FileEntity: 'entity.File',
  }),
  withHandler,
], async ({ params, FileEntity, next }) => {
  let file;

  if (params instanceof objectId) {
    file = await FileEntity.findById(params);
  } else {
    file = await FileEntity.findOne({ query: params.query });
  }

  const result = await next(params);

  if (file) {
    await fs.unlink(await FileEntity.getPath(file));
  }

  return result;
});
