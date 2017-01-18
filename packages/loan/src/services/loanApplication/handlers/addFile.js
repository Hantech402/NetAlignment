import path from 'path';
import fs from 'fs';
import { decorators, applyDecorators } from 'octobus.js';
import Joi from 'joi';

const { withLookups, withHandler, withSchema } = decorators;

const schema = Joi.object().keys({
  uploadedFile: Joi.object().required(),
  loanApplication: Joi.object().required(),
}).required();

const handler = async ({ params, FileEntity, LoanApplicationEntity }) => {
  const { loanApplication, uploadedFile } = params;

  const filename = path.basename(uploadedFile.filename);
  const extension = path.extname(uploadedFile.filename);
  const uploadPath = uploadedFile.path;

  const file = await FileEntity.createOne({
    accountId: loanApplication.accountId,
    filename,
    size: uploadedFile.bytes,
    contentType: uploadedFile.headers['content-type'],
    extension,
    meta: {
      loanApplicationId: loanApplication._id,
    },
    uploadedAt: new Date(),
  });

  await LoanApplicationEntity.updateOne({
    query: {
      _id: loanApplication._id,
    },
    update: {
      $push: {
        fileIds: file._id,
      },
    },
  });

  const destination = await FileEntity.getPath(file);

  return new Promise((resolve, reject) => {
    fs.rename(uploadPath, destination, (err) => {
      if (err) {
        return reject(err);
      }

      return resolve(file);
    });
  });
};

export default applyDecorators([
  withSchema(schema),
  withLookups({
    FileEntity: 'entity.File',
    LoanApplicatioEntity: 'entity.LoanApplication',
  }),
  withHandler,
], handler);
