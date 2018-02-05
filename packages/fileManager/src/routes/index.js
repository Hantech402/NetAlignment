import { Router } from 'express';
import fileUpload from 'express-fileupload';
import Boom from 'boom';
import fs from 'fs';
import bluebird from 'bluebird';
import { ObjectID as objectId } from 'mongodb';

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

  router.delete(
    '/:id',
    permissions.requireAuth,
    async (req, res, next) => {
      try {
        const _id = objectId(req.params.id);
        const file = await FileManagerService.findOne({ query: { _id } });
        if (!file) return next(Boom.badRequest('File not found. Probably wrong file id.'));
        if (req.user._id !== file.userId) {
          return next(Boom.forbidden('You don\'t have permission to delete this file'));
        }

        await FileManagerService.deleteOne({ query: { _id } });
        res.sendStatus(200);
      } catch (err) {
        if (err.message.includes('24 hex')) next(Boom.badRequest('Wrong id format provided'));
        next(err);
      }
    },
  );

  return router;
};
