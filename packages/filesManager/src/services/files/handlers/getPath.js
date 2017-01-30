import path from 'path';

export default (uploadDir) => ({ params: file }) => (
  path.join(uploadDir, file.accountId.toString(), `${file._id}${file.extension}`)
);
