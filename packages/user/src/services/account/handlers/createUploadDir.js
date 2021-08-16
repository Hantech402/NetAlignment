import { decorators, applyDecorators } from 'octobus.js';
import fs from 'fs-promise';

const { withLookups } = decorators;

export default applyDecorators([
  withLookups({
    AccountEntity: 'entity.Account',
  }),
], async ({ params, AccountEntity }) => fs.ensureDir(await AccountEntity.getUploadDir(params)));
