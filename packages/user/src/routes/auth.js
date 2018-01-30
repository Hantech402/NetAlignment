import { Router } from 'express';
import Celebrate from 'celebrate';
import Joi from 'joi';
import pick from 'lodash/pick';
// import { helpers } from 'makeen-mongodb';

import { requireAdmin, requireAuth } from '../middlewares';
import userSchema from '../schemas/userSchema';

export const userRouter = configRouter => {
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
        const userResponse = pick(user, ['accountId', '_id', 'title', 'email', 'username', 'role', 'address', 'isActive', 'createdAt', 'updatedAt']);
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
        const account = await AccountRepository.getAccount(user._id);
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
        const account = await AccountRepository.getAccount(userProfile._id);
        const accountReponse = pick(account, ['licenseNr', 'loanOfficersEmails', 'isConfirmed', 'isActive', 'isDeactivated']);
        res.json({ ...userProfile, _account: accountReponse });
      } catch (err) {
        next(err);
      }
    },
  );

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

  return router;
};
