import { decorators, applyDecorators } from 'octobus.js';

const { withLookups } = decorators;

export default applyDecorators([
  withLookups({
    AccountEntity: 'entity.Account',
  }),
], async ({ params, next, AccountEntity }) => {
  const account = await next(params);
  await AccountEntity.createUploadDir(account);
  return account;
});
