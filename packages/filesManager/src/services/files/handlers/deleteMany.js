import fs from 'fs-promise';
import { decorators, applyDecorators } from 'octobus.js';

const { withLookups, withHandler } = decorators;

export default applyDecorators([
  withLookups({
    FileEntity: 'entity.File',
  }),
  withHandler,
], async ({ params, FileEntity, next }) => {
  const { query } = params;

  const files = await FileEntity.findMany({
    query,
    fields: ['accountId', 'extension'],
  }).then((c) => c.toArray());

  const result = await next(params);

  if (Array.isArray(files) && files.length) {
    return Promise.all(
      files.map(
        (file) => FileEntity.getPath(file).then((path) => fs.unlink(path)),
      ),
    );
  }

  return result;
});
