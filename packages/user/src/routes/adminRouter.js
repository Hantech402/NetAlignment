import { Router } from 'express';
// import { helpers } from 'makeen-mongodb';

import { requireAdmin } from '../middlewares';

export const adminRouter = adminRouterConfig => {
  const {
    UserRepository,
    // AccountRepository,
    config,
    router = Router(),
  } = adminRouterConfig;

  router.get(
    '/',
    requireAdmin(config),
    async (req, res, next) => {
      try {
        const users = await UserRepository.getAllUsers();
        res.json(users);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    '/count',
    requireAdmin(config),
    async (req, res, next) => {
      try {
        const usersCount = await UserRepository.count();
        res.json(usersCount);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    '/:id',
    requireAdmin(config),
    async (req, res, next) => {
      try {
        const user = await UserRepository.getById(req.params.id);
        res.json(user);
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
};
