import { Router } from 'express';
import Celebrate from 'celebrate';
import Joi from 'joi';
import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';

// import userSchema from '../../schemas/userSchema';

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
     * @returns {array} 200
     * @security jwtToken
    */
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
    /**
     * Count all users
     * @route GET /users/count
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
    * @route GET /users/{id}
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
     * @route PATCH /users/{id}
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

  // router.put(
  //   '/:id',
  //   // Celebrate({ body: { ...userSchema } }),
  //   async (req, res, next) => {
  //     try {
  //       const _id = objectId(req.params.id);
  //       await UserRepository.replaceOne({
  //         query: { _id },
  //         replace: req.body,
  //       });
  //
  //       res.sendStatus(200);
  //     } catch (err) {
  //       next(err);
  //     }
  //   },
  // );
  //
  return router;
};
