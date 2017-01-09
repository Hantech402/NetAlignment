import fs from 'fs';

export default (app) => ({ result }) => {
  if (!result || !result._id) {
    return;
  }

  const rootUploadDir = app.uploadDir;
  const dirPath = `${rootUploadDir}/${result._id}`;
  fs.mkdir(dirPath);
};
