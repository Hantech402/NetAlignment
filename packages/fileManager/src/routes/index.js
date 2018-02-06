import { Router } from 'express';
import fileUpload from 'express-fileupload';
import Boom from 'boom';
import fs from 'fs';
import bluebird from 'bluebird';
import { ObjectID as objectId } from 'mongodb';
import archiver from 'archiver';
import rimraf from 'rimraf';

const getFileStats = bluebird.promisify(fs.stat);
const deleteFile = bluebird.promisify(fs.unlink);
const rmdir = bluebird.promisify(rimraf);

export const fileManagerRouter = indexRouterConfig => {
  const {
    FileManagerService,
    config,
    permissions,
    router = Router(),
  } = indexRouterConfig;

  router.use(permissions.requireAuth);

  router.post(
    '/upload',
    fileUpload({ safeFileNames: true, preserveExtension: true }),
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
          accountId: objectId(req.user.accountId),
          userId: objectId(req.user._id),
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
    async (req, res, next) => {
      try {
        const files = await FileManagerService.findMany({
          query: { userId: objectId(req.user._id) },
        }).toArray();

        res.json({ files });
      } catch (err) {
        next(err);
      }
    },
  );

  router.delete(
    '/:id',
    async (req, res, next) => {
      try {
        const _id = objectId(req.params.id);
        const file = await FileManagerService.findOne({ query: { _id } });
        if (!file) return next(Boom.notFound('File not found. Probably wrong file id.'));
        if (req.user._id !== file.userId.toString()) {
          return next(Boom.forbidden('You don\'t have permission to delete this file'));
        }

        await deleteFile(file.name);
        await FileManagerService.deleteOne({ query: { _id } });
        res.sendStatus(200);
      } catch (err) {
        if (err.message.includes('24 hex')) next(Boom.badRequest('Wrong id format provided'));
        next(err);
      }
    },
  );

  router.get(
    '/:id/download',
    async (req, res, next) => {
      try {
        const _id = objectId(req.params.id);
        const userId = objectId(req.user._id);
        const dbFile = await FileManagerService.findOne({ query: { _id, userId } });

        if (!dbFile) return next(Boom.notFound('File not found. Probably wrong file id.'));
        res.sendFile(dbFile.filename);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    '/archive',
    async (req, res, next) => {
      try {
        const files = await FileManagerService.count({
          query: { userId: objectId(req.user._id) },
        });
        if (!files) return next(Boom.notFound('You do not have any file'));

        const archive = archiver('zip');
        archive.on('error', err => { throw err; });
        archive.pipe(res);
        archive.directory(`${config.usersFilesPath}/${req.user.accountId}`, false).finalize();
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/empty',
    async (req, res, next) => {
      try {
        await rmdir(`${config.usersFilesPath}/${req.user.accountId}/*`);
        await FileManagerService.deleteMany({
          query: { userId: objectId(req.user._id) },
        });

        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
};
