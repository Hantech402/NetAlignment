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
    LoanApplication: 'entity.LoanApplication',
  }),
], async ({ params, AccountEntity, FileEntity, LoanApplication }) => {
  const { _id, reason } = params;
  const accountId = _id;

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

  await Promise.all([
    LoanApplication.deleteMany({
      query: { accountId },
    }),
    FileEntity.deleteMany({
      query: { accountId },
    }),
  ]);

  return result;
});
