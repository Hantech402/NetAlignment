import { Router } from 'express';
import Celebrate from 'celebrate';
import crypto from 'crypto';
import Joi from 'joi';
import Boom from 'boom';
import pick from 'lodash/pick';
// import { helpers } from 'makeen-mongodb';
import { ObjectID as objectId } from 'mongodb';

import userSchema from '../../schemas/userSchema';
import accountSchema from '../../schemas/accountSchema';
import { setUserInfo } from '../../utils'; // pick needed information from object

export const commonUserRouter = configRouter => {
  const {
    UserRepository,
    AccountRepository,
    // config,
    router = Router(),
    permissions,
  } = configRouter;

  router.post(
    '/register',
    Celebrate({
      body: Joi.object().keys({
        ...userSchema,
        licenseNr: Joi.any().when('role', {
          is: Joi.any().valid(['lender', 'broker']),
          then: Joi.string().required(),
        }),
        employeesNr: Joi.number().allow(null),
        loanApplication: Joi.any().when('role', {
          is: 'borrower',
          then: Joi.object().keys(
            pick(accountSchema, ['financialGoal', 'rate', 'termsByRate']),
          ),
        }),
      }).required(),
    }),

    async (req, res, next) => {
      try {
        const user = await UserRepository.register(req.body);
        const account = await AccountRepository.createOne({ userId: user._id, ...req.body });
        await UserRepository.updateOne({
          query: { _id: user._id },
          update: { $set: { accountId: account._id } },
        });
        await UserRepository.sendConfirmationEmail({
          email: user.email,
          accountId: account._id,
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
        const userData = await UserRepository.login(req.body);
        const token = await UserRepository.generateToken({ userData });
        const userResponse = pick(userData, 'accountId', 'username', 'email', '_id', 'updatedAt', 'createdAt', 'lastLogin', 'role');
        res.json({ ...userResponse, token });
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/refresh-token',
    Celebrate({ body: Joi.object().keys({
      token: Joi.string().required(),
    }).required() }),
    async (req, res, next) => {
      try {
        const token = await UserRepository.refreshToken({ token: req.body.token });
        res.json({ token });
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    '/me',
    permissions.requireAuth,
    Celebrate({ headers: Joi.object({
      authorization: Joi.string().required(),
    }).unknown() }),
    async (req, res, next) => {
      try {
        const userProfile = await UserRepository.findOne({
          query: { _id: objectId(req.user._id) },
          options: { fields: { password: 0 } },
        });
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
    permissions.requireAuth,
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
    permissions.requireAuth,
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

  router.get(
    '/lenders',
    permissions.requireAuth, permissions.requireBorrower,
    async (req, res, next) => {
      try {
        const lenders = await UserRepository.findMany({
          query: { role: 'lender' },
          fields: { password: 0 },
        }).toArray();

        res.json(lenders);
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
};
