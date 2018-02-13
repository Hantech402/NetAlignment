import { Router } from 'express';
import Celebrate from 'celebrate';
import Joi from 'joi';
import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';
import pick from 'lodash/pick';

import userSchema from '../../schemas/userSchema';
import { setUserInfo } from '../../utils';

export const adminRouter = adminRouterConfig => {
  const {
    UserRepository,
    AccountRepository,
    // config,
    permissions,
    router = Router(),
  } = adminRouterConfig;

  router.use(permissions.requireAuth, permissions.requireAdmin);

  router.get(
    /**
     * Get all users
     * @route GET /users
     * @group Users
     * @param {object} query.query - mongo query obj
     * @returns {array} 200
     * @security jwtToken
    */
    '/',
    async (req, res, next) => {
      try {
        const users = await UserRepository
          .findMany({ query: req.query.query || {}, fields: { password: 0 } })
          .toArray();

        res.json(users);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    /**
     * Count all users
     * @route GET /users/count
     * @group Users
     * @returns {number} 200
     * @security jwtToken
    */
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
    /**
    * Get user's obj
    * @route GET /users/findOne
     * @group Users
    * @param {object} query.query.required - mongo query object
    * @returns {object} 200 - user's object
    * @security jwtToken
    */
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
    /**
    * Get user by id
    * @route GET /users/:id
    * @group Users
    * @param {string} id.path.required - mongoId
    * @returns {object} 200 - user's object
    * @security jwtToken
    */
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
    /**
     * Delete user
     * @route DELETE /users/deleteOne
     * @group Users
     * @param {string} query.query.required
     * @security jwtToken
     */
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
    /**
     * Update user's profile
     * @route PATCH /users/{id}/
     * @group Users
     * @param {string} id.path.required
     * @security jwtToken
     */
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

  router.post(
    /**
     * Register new admin by another admin
     * @route POST /users/resgister
     * @group Users
     * @param {string} username.body.requried
     * @param {string} password.body.required
     * @param {string} email.body.required
     * @param {string} streetAddress1.address.body.required
     * @returns {object} 200 - user's object
     */

    '/register-admin',
    Celebrate({ body:
      Joi.object().keys({
        ...userSchema,
        role: Joi.string(),
      }).required() }),
    async (req, res, next) => {
      try {
        const user = await UserRepository.register({ ...req.body, role: 'admin' });
        const account = await AccountRepository.createOne({
          userId: user._id,
          ...req.body,
          isConfirmed: true,
        });

        await UserRepository.updateOne({
          query: { _id: user._id },
          update: { $set: { accountId: account._id } },
        });

        const userResponse = setUserInfo(user);
        const accountReponse = pick(account, ['isConfirmed', 'isActive', '_id', 'updatedAt', 'createdAt']);
        res.json({ user: userResponse, account: accountReponse });
      } catch (err) {
        next(err);
      }
    },
  );

  router.patch(
    /**
     * Change user's account status ({ isActive: true/false })
     * @route PATCH /users/:userId/change-status
     * @group Users
     * @param {string} userId.path.required
     * @param {boolean} isActive.body.required
     * @returns 200
     * @security jwtToken
    */

    '/:userId/change-status',
    Celebrate({ body: Joi.object().keys({
      isActive: Joi.bool().required(),
    }).required() }),
    async (req, res, next) => {
      try {
        const _id = objectId(req.params.userId);
        const user = await UserRepository.findOne({ query: { _id } });
        if (!user) throw Boom.notFound('Unable to find user');

        await AccountRepository.updateOne({
          query: { _id: user.accountId },
          update: { $set: { isActive: req.body.isActive } },
        });

        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
};
