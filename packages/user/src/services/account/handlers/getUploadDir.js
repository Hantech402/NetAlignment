import path from 'path';

export default (uploadDir) => ({ params: account }) => path.join(uploadDir, account._id.toString());
