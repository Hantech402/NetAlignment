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
    LoanApplicationRepository,
    AccountRepository,
    // config,
    permissions,
    router = Router(),
  } = indexRouterConfig;

  router.get(
    /**
    * Confirm user's account
    * @route GET /account/{id}/confirm
    * @group Account
    * @param {string} id.path.required
    * @returns {object} 200 - updated account object
    */

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
    /**
     * Deactivate account and all loan applications
     * @route POST /account/deactivate
     * @group Account
     * @param {string} reason.body.required
     * @security jwtToken
     */

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

        await LoanApplicationRepository.updateMany({
          query: { accountId: objectId(req.user.accountId) },
          update: { $set: { status: 'canceled' } },
        });

        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    /**
     * Reactivate account
     * @route POST /account/reactivate
     * @group Account
     * @param {string} username.body.required
     * @param {string} password.body.required
     * @returns {object} 200 - user's object
     */

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
    /**
     * Resend activation email
     * @route POST /account/resend-activation-email
     * @group Account
     * @param {string} usernameOrEmail.body.required
     */
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

  router.get(
    /**
     * Find broker
     * @route GET /account/find-broker
     * @group Account
     * @param {string} licenseNr.query.required
     * @param {string} employeeEmail.query.required
     * @returns {object} 200 - user's object
     */
    '/find-broker',
    Celebrate({ query: Joi.object().keys({
      licenseNr: Joi.string().allow(null),
      employeeEmail: Joi.string().email().allow(null),
    }) }),
    async (req, res, next) => {
      try {
        const { licenseNr, employeeEmail } = req.query;
        const query = { isActive: true, isDeactivated: false, isConfirmed: true };

        if (licenseNr) query.licenseNr = licenseNr;
        if (employeeEmail) query.employeeEmail = employeeEmail;

        const account = await AccountRepository.findOne({ query });
        if (!account) throw Boom.notFound('Unable to find account');

        const user = await UserRepository.findOne({
          query: {
            accountId: account._id,
            role: 'broker',
            isAccountOwner: true,
          },
        });

        if (!user) throw Boom.notFound('Unable to find user account');

        res.json({
          accountId: account._id,
          userId: user._id,
          ...pick(user, ['firstName', 'middleName', 'lastName']),
        });
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
};
