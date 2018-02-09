import { Router } from 'express';
import fileUpload from 'express-fileupload';
import Boom from 'boom';
import fs from 'fs';
import bluebird from 'bluebird';
import { ObjectID as objectId } from 'mongodb';
import rimraf from 'rimraf';
import Joi from 'joi';
import Celebrate from 'celebrate';
import Hawk from 'hawk';

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

  router.get(
    /**
     * Download file by id
     * @route GET /files/{id}/download
     * @group FileManager
     * @param {string} id.path.required
     * @returns {file} 200 - downloads a file
     * @security jwtToken
    */

    '/:id/download',
    async (req, res, next) => {
      try {
        const _id = objectId(req.params.id);
        let accountId;
        if (req.query.bewit) {
          req.url = req.originalUrl;
          const credentialsFunc = (id) => ({ ...config.bewitCredentials, id });
          const { credentials } = await Hawk.uri.authenticate(req, credentialsFunc);
          accountId = objectId(credentials.id);
        } else {
          config.decodeAndVerifyToken(req, res, next);
          accountId = objectId(req.user.accountId);
        }
        const dbFile = await FileManagerService.findOne({ query: { _id, accountId } });

        if (!dbFile) return next(Boom.notFound('File not found. Probably wrong file id.'));
        res.sendFile(dbFile.filename);
      } catch (err) {
        next(err);
      }
    },
  );

  router.use(permissions.requireAuth);

  router.post(
    /**
     * Upload file
     * @route POST /files/upload
     * @group FileManager
     * @param file.formData.required
     * @security jwtToken
    */
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
    /**
     * Get all user's files objects (db)
     * @route GET /files
     * @group FileManager
     * @param {string} query.query.required
     * @returns {object} 200
     * @security jwtToken
    */

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
    /**
     * Delete file
     * @route DELETE /files/:id
     * @group FileManager
     * @param {string} id.path.required
     * @security jwtToken
    */
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
    /**
     * archive all user's files
     * @route GET /files/archive
     * @group FileManager
     * @returns {file} 200 - zip archive of all user's files
     * @security jwtToken
    */

    '/archive',
    async (req, res, next) => {
      try {
        const files = await FileManagerService.findOne({
          query: { userId: objectId(req.user._id) },
        });
        if (!files) return next(Boom.notFound('You do not have any file'));

        const dirPath = `${config.usersFilesPath}/${req.user.accountId}`;
        FileManagerService.archiveDirs({ dirPath, res });
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    /**
     * Delete all users files
     * @route POST /files/empty
     * @group FileManager
     * @security jwtToken
    */

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

  router.post(
    /**
    * Sign file for save download (60seconds)
    * @route POST /files/sign-url
    * @group FileManager
    * @param {string} url.body.required
    * @returns {string} url.body.required
    * @security jwtToken
    */

    '/sign-url',
    Celebrate({ body: Joi.object().keys({
      url: Joi.string().required(),
    }).required() }),
    async (req, res, next) => {
      try {
        const options = {
          credentials: {
            id: req.user.accountId,
            ...config.bewitCredentials,
          },
          ttlSec: 60,
        };
        const bewit = Hawk.uri.getBewit(req.body.url, options);
        res.json({ url: `${req.body.url}?bewit=${bewit}` });
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
};
