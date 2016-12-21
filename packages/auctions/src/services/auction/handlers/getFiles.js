import { decorators, applyDecorators } from 'octobus.js';
import Joi from 'joi';

const { withLookups, withHandler, withSchema } = decorators;

const schema = Joi.object().keys({
  auctionId: Joi.object().required(),
}).required();

const handler = async ({ params, FileEntity }) => {
  const { auctionId } = params;

  const files = await FileEntity.findMany({
    query: {
      meta: {
        auctionId,
      },
    },
  }).then((c) => c.toArray());

  return Promise.all(
    files.map(
      async (file) => ({
        ...file,
        path: await FileEntity.getPath(file),
      }),
    ),
  );
};

export default applyDecorators([
  withSchema(schema),
  withLookups({
    FileEntity: 'entity.File',
  }),
  withHandler,
], handler);
