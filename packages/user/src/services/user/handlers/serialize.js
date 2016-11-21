import { decorators } from 'octobus.js';

const { withHandler } = decorators;

const handler = ({ _id, username, accountId }) => ({ id: _id, username, accountId });

export default withHandler(handler);
