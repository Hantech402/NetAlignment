import fs from 'fs';
import { decorators, applyDecorators } from 'octobus.js';
import Joi from 'joi';

const { withLookups, withHandler, withSchema } = decorators;

const schema = Joi.object().keys({
  file: Joi.object().required(),
  auction: Joi.object().required(),
}).required();

const handler = async ({ params, FileEntity, AuctionEntity }) => {
  const { auction, file } = params;

  return Promise.all([
    await FileEntity.deleteOne({
      query: {
        _id: file._id,
      },
    }),
    await AuctionEntity.updateOne({
      query: {
        _id: auction._id,
      },
      update: {
        $pull: {
          fileIds: file._id,
        },
      },
    }),
    new Promise(async (resolve, reject) => {
      const filePath = await FileEntity.getPath(file);
      fs.unlink(filePath, (err) => (err ? reject(err) : resolve()));
    }),
  ]);
};

export default applyDecorators([
  withSchema(schema),
  withLookups({
    FileEntity: 'entity.File',
    AuctionEntity: 'entity.Auction',
  }),
  withHandler,
], handler);
