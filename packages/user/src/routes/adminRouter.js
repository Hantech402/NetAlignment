import { Router } from 'express';
import Celebrate from 'celebrate';
import Joi from 'joi';
// import { helpers } from 'makeen-mongodb';

import { requireAdmin } from '../middlewares';

export const adminRouter = adminRouterConfig => {
  const {
    UserRepository,
    AccountRepository,
    config,
    router = Router(),
  } = adminRouterConfig;

  router.use(requireAdmin(config));

  router.get(
    '/',
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
    '/findOne',
    Celebrate({ query: Joi.object().keys({
      query: Joi.object().required(),
    }) }),
    async (req, res, next) => {
      try {
        const user = await UserRepository.findOne({ query: req.query.query });
        const account = await AccountRepository.findOne({ query: { ownerId: user._id } });
        user._account = account; // eslint-disable-line no-underscore-dangle
        res.json(user);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    '/:id',
    async (req, res, next) => {
      try {
        const user = await UserRepository.getById(req.params.id);
        res.json(user);
      } catch (err) {
        next(err);
      }
    },
  );

  router.delete(
    '/deleteOne',
    Celebrate({ body: Joi.object().keys({
      query: Joi.object().required(),
    }).required() }),
    async (req, res, next) => {
      try {
        const userId = await UserRepository.deleteOne({ query: req.body.query });
        await AccountRepository.deleteOne({ userId });
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
};
