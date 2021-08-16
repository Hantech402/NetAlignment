import { decorators } from 'octobus.js';

const { withHandler } = decorators;

const handler = ({ _id, username, accountId, role }) =>
  ({ id: _id, username, accountId, scope: role });

export default withHandler(handler);
