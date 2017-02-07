import Joi from 'joi';
import { decorators, applyDecorators } from 'octobus.js';

const { withSchema, withLookups } = decorators;

const schema = Joi.object().keys({
  _id: Joi.object().required(),
  reason: Joi.string().required(),
}).required();

export default applyDecorators([
  withSchema(schema),
  withLookups({
    AccountEntity: 'entity.Account',
    FileEntity: 'entity.File',
  }),
], async ({ params, AccountEntity, FileEntity }) => {
  const { _id, reason } = params;

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

  await FileEntity.deleteMany({
    query: {
      accountId: _id,
    },
  });

  return result;
});
