import { Router } from 'express';
import Celebrate from 'celebrate';
import crypto from 'crypto';
import Joi from 'joi';
import Boom from 'boom';
import pick from 'lodash/pick';
// import { helpers } from 'makeen-mongodb';

import { requireAuth } from '../../middlewares';
import userSchema from '../../schemas/userSchema';
import { setUserInfo } from '../../utils';

export const commonUserRouter = configRouter => {
  const {
    UserRepository,
    AccountRepository,
    config,
    router = Router(),
  } = configRouter;

  router.post(
    '/register',
    Celebrate({ body: userSchema }),
    async (req, res, next) => {
      try {
        const user = await UserRepository.register(req.body);
        const account = await AccountRepository.createOne(user._id);
        await UserRepository.updateOne({
          query: { _id: user._id },
          update: { $set: { accountId: user._id.toString() } },
        });
        const userResponse = setUserInfo(user);
        const accountReponse = pick(account, ['isConfirmed', 'isActive', '_id', 'updatedAt', 'createdAt']);
        res.json({ user: userResponse, account: accountReponse });
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/login',
    Celebrate({ body: Joi.object().keys({
      username: Joi.string().required(),
      password: Joi.string().required(),
    }) }),
    async (req, res, next) => {
      try {
        const user = await UserRepository.login(req.body);
        const account = await AccountRepository.findOne({ query: { ownerId: user._id } });
        const token = await UserRepository.generateToken({
          userData: user,
          accountId: account._id.toString(),
        });
        const userResponse = pick(user, 'accountId', 'username', 'email', '_id', 'updatedAt', 'createdAt', 'lastLogin', 'role');
        res.json({ ...userResponse, token, accountId: account._id.toString() });
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    '/me',
    Celebrate({ headers: Joi.object({
      authorization: Joi.string().required(),
    }).unknown() }),
    async (req, res, next) => {
      try {
        const userProfile = await UserRepository.getUserProfile(req.headers.authorization);
        const account = await AccountRepository.findOne({ query: { ownerId: userProfile._id } });
        const accountReponse = pick(account, ['licenseNr', 'loanOfficersEmails', 'isConfirmed', 'isActive', 'isDeactivated']);
        res.json({ ...userProfile, _account: accountReponse });
      } catch (err) {
        next(err);
      }
    },
  );

  router.patch(
    '/me',
    requireAuth(config),
    Celebrate({ body: {
      ...pick(userSchema, [
        'title', 'firstName', 'middleName', 'lastName', 'address',
      ]),
      address: userSchema.address.optional(),
    } }),
    async (req, res, next) => {
      try {
        const updatedUser = await UserRepository.updateProfile({
          userId: req.user._id,
          data: req.body,
        });

        res.json(updatedUser);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/change-password',
    requireAuth(config),
    Celebrate({ body: Joi.object().keys({
      password: Joi.string().required(),
      oldPassword: Joi.string().required(),
    }) }),
    async (req, res, next) => {
      try {
        await UserRepository.changePassword({ userId: req.user._id, password: req.body.password });
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/reset-password',
    Celebrate({ body: Joi.object().keys({
      usernameOrEmail: Joi.string().required(),
    }) }),
    async (req, res, next) => {
      try {
        const usernameOrEmail = req.body.usernameOrEmail;
        const user = await UserRepository.findByUsernameOrEmail({ usernameOrEmail });

        if (!user) throw Boom.notFound('Wrong username ro email');
        const resetPassword = {
          token: crypto.randomBytes(20).toString('hex'),
          resetAt: new Date(),
        };

        /* const updateResult = */ await UserRepository.updateOne({
          query: { _id: user._id },
          update: { $set: { resetPassword } },
        });

        res.json({ user: { ...setUserInfo(user) } /* , updateResult */ });
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/recover-password/:token',
    Celebrate({
      params: Joi.object().keys({
        token: Joi.string().required(),
      }).required(),
      body: Joi.object().keys({
        password: Joi.string().required(),
      }).required(),
    }),
    async (req, res, next) => {
      try {
        const user = await UserRepository.updatePasswordWithToken({
          token: req.params.token,
          password: req.body.password,
        });
        const userResponse = setUserInfo(user);
        res.json({ user: userResponse });
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
};
