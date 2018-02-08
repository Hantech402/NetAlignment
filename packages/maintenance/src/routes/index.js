import { Router } from 'express';
import Bluebird from 'bluebird';
import fs from 'fs';
import path from 'path';

const mkdir = Bluebird.promisify(fs.mkdir);

function ensureDir(dirPath) {
  return new Promise((resolve, reject) => {
    fs.stat(dirPath, err => {
      if (err && err.code === 'ENOENT') {
        return resolve(mkdir(dirPath));
      } else if (err) return reject(err);

      resolve(); // if dir is already exists
    });
  });
}

export const maintenanceRouter = routerConfig => {
  const {
    AccountRepository,
    permissions,
    config,
    router = Router(),
  } = routerConfig;

  router.use(permissions.requireAuth, permissions.requireAdmin);

  router.post(
    /**
    * Create upload dirs for all accounts
    * @route POST /maintenance/create-upload-dirs
    * @security jwtToken
    */
    '/create-upload-dirs',
    async (req, res, next) => {
      try {
        const accounts = await AccountRepository.findMany({
          query: {},
          fields: { _id: 1 },
        }).toArray();
        const dirPromises = [];

        accounts.forEach(acc => {
          dirPromises.push(ensureDir(path.join(config.usersFilesPath, acc._id.toString())));
        });

        await Promise.all(dirPromises);
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
};
