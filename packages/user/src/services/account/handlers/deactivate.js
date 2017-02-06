import Joi from 'joi';
import { decorators, applyDecorators } from 'octobus.js';

const { withSchema, withLookups } = decorators;

const schema = Joi.object().keys({
  _id: Joi.object().required(),
  reason: Joi.string().required(),
  deleteFiles: Joi.boolean().default(false),
}).required();

export default applyDecorators([
  withSchema(schema),
  withLookups({
    AccountEntity: 'entity.Account',
    FileEntity: 'entity.File',
  }),
], async ({ params, AccountEntity, FileEntity }) => {
  const { _id, reason, deleteFiles } = params;

  const result = await AccountEntity.updateOne({
    query: {
      _id,
    },
    update: {
      $set: {
        isDeactivated: true,
        deactivationReason: reason,
      },
    },
  });

  if (deleteFiles) {
    await FileEntity.deleteMany({
      query: {
        accountId: _id,
      },
    });
  }

  return result;
});
