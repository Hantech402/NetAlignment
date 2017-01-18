import fs from 'fs';
import { decorators, applyDecorators } from 'octobus.js';
import Joi from 'joi';

const { withLookups, withHandler, withSchema } = decorators;

const schema = Joi.object().keys({
  file: Joi.object().required(),
  loanApplication: Joi.object().required(),
}).required();

const handler = async ({ params, FileEntity, LoanApplicationEntity }) => {
  const { loanApplication, file } = params;

  return Promise.all([
    await FileEntity.deleteOne({
      query: {
        _id: file._id,
      },
    }),
    await LoanApplicationEntity.updateOne({
      query: {
        _id: loanApplication._id,
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
    LoanApplicationEntity: 'entity.LoanApplication',
  }),
  withHandler,
], handler);
