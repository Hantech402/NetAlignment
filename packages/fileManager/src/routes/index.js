import { Router } from 'express';
import fileUpload from 'express-fileupload';
import Boom from 'boom';

export const fileManagerRouter = indexRouterConfig => {
  const {
    FileManagerService,
    config,
    permissions,
    router = Router(),
  } = indexRouterConfig;

  router.use(fileUpload({ safeFileNames: true, preserveExtension: true }));

  router.post(
    '/upload',
    permissions.requireAuth,
    async (req, res, next) => {
      try {
        if (!req.files) return next(Boom.badRequest('No files were uploaded'));
        const file = req.files.file;
        const fileParts = file.name.split('.');
        const fileExt = fileParts[fileParts.length - 1];
        const filePath = `${config.usersFilesPath}/${req.user.accountId}/${file.name}`;

        await file.mv(filePath);
        await FileManagerService.createOne({
          accountId: req.user.accountId,
          userId: req.user._id,
          filename: filePath,
          extension: fileExt,
          size: 5,
          contentType: req.headers['content-type'],
          uploadedAt: new Date(),
        });

        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
};
