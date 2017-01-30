import path from 'path';
import { decorators, applyDecorators } from 'octobus.js';
import Joi from 'joi';
import fs from 'fs-promise';

const { withLookups, withHandler, withSchema } = decorators;

const schema = Joi.object().keys({
  accountId: Joi.object().required(),
  userId: Joi.object().required(),
  filename: Joi.string().required(),
  path: Joi.string().required(),
  bytes: Joi.number().required(),
  headers: Joi.object().required(),
  meta: Joi.object().default({}),
  getPath: Joi.func().allow(null),
}).required();

const handler = async ({ params, FileEntity }) => {
  const { meta, accountId, userId } = params;
  const uploadPath = params.path;

  const file = await FileEntity.createOne({
    accountId,
    userId,
    filename: path.basename(params.filename),
    extension: path.extname(params.filename),
    size: params.bytes,
    contentType: params.headers['content-type'],
    uploadedAt: new Date(),
    meta,
  });

  const destination = params.getPath ? params.getPath(file) : await FileEntity.getPath(file);

  await fs.rename(uploadPath, destination);

  return file;
};

export default applyDecorators([
  withSchema(schema),
  withLookups({
    FileEntity: 'entity.File',
  }),
  withHandler,
], handler);
