import { Router } from 'express';
import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';
import Celebrate from 'celebrate';
import pick from 'lodash/pick';
import Joi from 'joi';

import userSchema from '../../schemas/userSchema';
import { setUserInfo } from '../../utils';

export const accountRouter = indexRouterConfig => {
  const {
    UserRepository,
    AccountRepository,
    // config,
    permissions,
    router = Router(),
  } = indexRouterConfig;

  router.get(
    '/:id/confirm',
    async (req, res, next) => { // eslint-disable-line consistent-return
      try {
        const id = req.params.id;
        const account = await AccountRepository.findOne({ query: { _id: objectId(id) } });
        if (!account) return next(Boom.notFound('Cannot find account with provided id'));
        if (account.isConfirmed) return next(Boom.badRequest('This account is already confirmed'));

        const updatedAccount = await AccountRepository.updateOne({
          query: { _id: objectId(req.params.id) },
          update: { $set: { isConfirmed: true } },
          options: { new: true },
        });

        res.json(updatedAccount);
      } catch (err) {
        if (err.message.includes('24 hex')) next(Boom.badRequest('Wrong id format provided'));
        next(err.message || err);
      }
    },
  );

  router.post(
    '/deactivate',
    permissions.requireAuth,
    Celebrate({ body: Joi.object().keys({
      reason: Joi.string().required(),
    }).required() }),
    async (req, res, next) => {
      try {
        if (req.user.scope === 'admin') throw Boom.forbidden('Insufficient scope');
        await AccountRepository.updateOne({
          query: { ownerId: objectId(req.user._id) },
          update: { $set: { isDeactivated: true } },
        });
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/reactivate',
    Celebrate({ body: Joi.object().keys({
      ...pick(userSchema, ['username', 'password']),
    }).required() }),
    async (req, res, next) => {
      try {
        const { username, password } = req.body;
        const user = await UserRepository.verifyCredentials({ username, password });
        await AccountRepository.updateOne({
          query: { ownerId: user._id },
          update: { $set: { isDeactivated: false } },
        });

        res.json(setUserInfo(user));
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/resend-activation-email',
    Celebrate({ body: Joi.object().keys({
      usernameOrEmail: Joi.string().required(),
    }).required() }),
    async (req, res, next) => {
      try {
        const usernameOrEmail = req.body.usernameOrEmail;
        const user = await UserRepository.findByUsernameOrEmail({ usernameOrEmail });

        if (!user) throw Boom.notFound('Wrong username or email. User not found');
        const account = await AccountRepository.findOne({ query: { ownerId: user._id } });
        if (account.isConfirmed) throw Boom.badRequest('Your account is already confirmed');
        await UserRepository.sendConfirmationEmail({
          email: user.email,
          accountId: account._id.toString(),
        });
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
};
