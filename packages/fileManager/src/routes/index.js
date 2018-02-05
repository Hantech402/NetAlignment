import { Router } from 'express';
import fileUpload from 'express-fileupload';
import Boom from 'boom';
import fs from 'fs';
import bluebird from 'bluebird';

const getFileStats = bluebird.promisify(fs.stat);

export const fileManagerRouter = indexRouterConfig => {
  const {
    FileManagerService,
    config,
    permissions,
    router = Router(),
  } = indexRouterConfig;

  router.post(
    '/upload',
    fileUpload({ safeFileNames: true, preserveExtension: true }),
    permissions.requireAuth,
    async (req, res, next) => {
      try {
        if (!req.files) return next(Boom.badRequest('No files were uploaded'));
        const file = req.files.file;
        const fileParts = file.name.split('.');
        const fileExt = fileParts[fileParts.length - 1];
        const filePath = `${config.usersFilesPath}/${req.user.accountId}/${file.name}`;

        await file.mv(filePath);
        const fileStats = await getFileStats(filePath);
        fileStats.size /= 1000000.0;

        await FileManagerService.createOne({
          accountId: req.user.accountId,
          userId: req.user._id,
          filename: filePath,
          extension: fileExt,
          size: fileStats.size,
          contentType: req.headers['content-type'],
          uploadedAt: new Date(),
        });

        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    '/',
    permissions.requireAuth,
    async (req, res, next) => {
      try {
        const files = await FileManagerService.findMany({
          query: { userId: req.user._id },
        }).toArray();

        res.json({ files });
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
};
