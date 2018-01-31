import { Router } from 'express';
import Celebrate from 'celebrate';
import Joi from 'joi';
import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';

// import { helpers } from 'makeen-mongodb';

import { requireAdmin } from '../../middlewares';

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
        const users = await UserRepository
          .findMany({ query: {}, fields: { password: 0 } })
          .toArray();

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
        const usersCount = await UserRepository.count({ query: req.query.query });
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
        const user = await UserRepository.findOne({
          query: { _id: objectId(req.params.id) },
          options: { fields: { password: 0 } },
        });
        if (!user) throw Boom.badRequest('Wrong id provided');
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
        const user = await UserRepository.findOne({ query: req.body.query });
        if (!user) throw Boom.notFound('User not found');
        await UserRepository.deleteOne({ query: { _id: user._id } });
        await AccountRepository.deleteOne({ query: { ownerId: user._id } });
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.patch(
    '/:id',
    Celebrate({
      params: Joi.object().keys({
        id: Joi.string().required(),
      }).required(),
      body: Joi.object().required(),
    }),
    async (req, res, next) => {
      try {
        await UserRepository.updateOne({
          query: { _id: objectId(req.params.id) },
          update: { $set: req.body },
        });
        res.sendStatus(200);
      } catch (err) {
        if (err.message.includes('24 hex')) next(Boom.badRequest('Wrong id format provided'));
        next(err.message || err);
      }
    },
  );

  return router;
};
