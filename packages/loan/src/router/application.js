import { Router } from 'express';
import { ObjectID as objectId } from 'mongodb';
import Boom from 'boom';
import Celebrate from 'celebrate';
import Joi from 'joi';
import omit from 'lodash/omit';

import loanAppScheme from '../schemas/loanApplication';

export const applicationRouter = config => {
  const {
    router = Router(),
    permissions,
    LoanApplicationRepository,
    FileManagerService,
    LoanEstimateRepository,
  } = config;

  router.use(permissions.requireAuth, permissions.requireBorrower);

  router.post(
    /**
    * Create loan application
    * @route POST /loans/applications/
    * @group LoanApp
    * @returns {object} 200 - loan object
    * @security jwtToken
    */

    '/',
    Celebrate({ body: omit(loanAppScheme, ['accountId', 'status']) }),
    async (req, res, next) => {
      try {
        if (req.body.fileIds) req.body.fileIds = req.body.fileIds.map(fileId => objectId(fileId));
        if (!req.user.isConfirmed) req.body.status = 'draft';

        const loanApp = await LoanApplicationRepository.createOne({
          ...req.body,
          accountId: req.user.accountId,
        });
        res.json(loanApp);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    /**
    * Find all user's loan apps
    * @route GET /loans/applications
    * @group LoanApp
    * @param {string} status.query.required - 'draft', 'open', 'closed', 'accepted'
    * @param {string} .path.required
    * @param {string} filter.query.required - 'nosubmitted', 'submitted'
    * @returns {object} 200 - loan obj
    * @security jwtToken
    */

    '/',
    Celebrate({ query: Joi.object().keys({
      status: Joi.string().valid(['draft', 'open', 'closed', 'accepted']),
      filter: Joi.string().valid(['nosubmitted', 'submitted']),
    }) }),

    async (req, res, next) => {
      try {
        const accountId = req.user.accountId;
        const query = { accountId };
        const { status, filter } = req.query;

        if (status) {
          query.status = status;
        } else if (filter) {
          query.submitted = filter === 'submitted';
          query.status = 'open';
        }

        const loanApps = await LoanApplicationRepository.findMany({ query }).toArray();

        res.json(loanApps);
      } catch (err) {
        next(err);
      }
    },
  );

  router.patch(
    /**
    * Update loan application
    * @route PATCH /loans/applications/:id
    * @group LoanApp
    * @param {string} id.path.required
    * @security jwtToken
    */

    '/:id',
    async (req, res, next) => {
      try {
        const _id = objectId(req.params.id);
        const accountId = req.user.accountId;
        const loanApp = await LoanApplicationRepository.findOne({ query: { _id, accountId } });

        if (!loanApp) throw Boom.notFound('Loan app not found. Probably wrong id');
        if (!loanApp.status !== 'draft') throw Boom.badRequest('Only draft auction could be edited');

        await LoanApplicationRepository.updateOne({
          query: { _id, accountId },
          update: { $set: req.body },
        });

        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.delete(
    /**
     * Delete loan application
     * @route DELETE /loans/application/deleteOne
     * @group LoanApp
     * @param {string} query.query.required
     * @security jwtToken
     * @returns 200
    */

    '/deleteOne',
    Celebrate({ body: Joi.object().keys({
      query: Joi.object().required(),
    }).required() }),
    async (req, res, next) => {
      try {
        const accountId = req.user.accountId;
        const query = { ...req.body.query, accountId };
        const loanAppExist = await LoanApplicationRepository.count({ query });
        if (!loanAppExist) throw Boom.notFound('Unable to find loan application');

        await LoanApplicationRepository.deleteOne({ query });
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.delete(
    /**
     * Delete loan application by id
     * @route DELETE /loans/applications/{id}/
     * @group LoanApp
     * @param {string} id.path.required
     * @security jwtToken
    */

    '/:id',
    async (req, res, next) => {
      try {
        const _id = objectId(req.params.id);
        const accountId = req.user.accountId;
        const loanApp = await LoanApplicationRepository.findOne({ query: _id, accountId });

        if (!loanApp) throw Boom.notFound('Unable to find auction. Probably wrong id');
        if (loanApp.status === 'expired') Boom.badRequest('Your auction is already expired');
        if (loanApp.status === 'cancled') Boom.badRequest('Your auction is already canceled');

        await LoanApplicationRepository.updateOne({
          query: { _id, accountId },
          update: { $set: { status: 'canceled', isDeleted: true } },
        });

        await LoanApplicationRepository.deleteOne({ query: { _id, accountId } });
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    /**
     * Count all user's loan applications
     * @route GET /loans/applications/count
     * @group LoanApp
     * @returns {number} 200
     * @security jwtToken
    */

    '/count',
    async (req, res, next) => {
      try {
        const accountId = req.user.accountId;
        const loanAppsCount = await LoanApplicationRepository.count({ query: { accountId } });
        res.json(loanAppsCount);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    /**
     * Find user's loan application
     * @route GET /loans/applications/findOne
     * @group LoanApp
     * @param {object} object.query.required - mongo query object
     * @returns {object} 200
     * @security jwtToken
    */

    '/findOne',
    Celebrate({ query: Joi.object().keys({
      query: Joi.object().required(),
    }).required() }),
    async (req, res, next) => {
      try {
        const query = req.query.query;
        const loan = await LoanApplicationRepository.findOne({ query });
        if (!loan) throw Boom.notFound('Unable to find loan application');

        res.json(loan);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    /**
    * Find loan app by id
    * @route GET /loans/applications/{id}
    * @group LoanApp
    * @param {string} id.path.required
    * @returns {object} 200 - loan object
    * @security jwtToken
    */

    '/:id',
    async (req, res, next) => {
      try {
        const _id = objectId(req.params.id);
        const accountId = req.user.accountId;
        const loanApp = await LoanApplicationRepository.findOne({ query: { _id, accountId } });

        if (!loanApp) throw Boom.notFound(`Cannot found loan application with id ${req.params.id}`);
        res.json(loanApp);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    /**
     * Get loan's app files objects by loan app id
     * @route GET /loans/applications/{id}/files
     * @group LoanApp
     * @param {string} id.path.required
     * @returns {array} 200 - array of files objects
     * @security jwtToken
    */

    '/:id/files',
    async (req, res, next) => {
      try {
        const _id = objectId(req.params.id);
        const loanApp = await LoanApplicationRepository.findOne({
          query: { _id },
          options: { fields: { fileIds: 1, accountId: 1 } },
        });
        if (!loanApp) throw Boom.notFound('Unable to find loan application');
        if (loanApp.accountId.toString() !== req.user.accountId) throw Boom.forbidden('Missing permissions');

        const files = await FileManagerService.findMany({
          query: {
            _id: {
              $in: loanApp.fileIds,
            },
          },
        }).toArray();

        res.json(files);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    /**
    * Download files by loan id
    * @route GET /loans/applications/{id}/files/archive
    * @group LoanApp
    * @param {string} id.path.required
    * @returns {file} 200 - zip file
    * @security jwtToken
    */

    '/:id/files/archive',
    async (req, res, next) => {
      try {
        const _id = objectId(req.params.id);
        const loanApp = await LoanApplicationRepository.findOne({
          query: { _id },
          options: { fields: { fileIds: 1, accountId: 1 } },
        });
        if (!loanApp) throw Boom.notFound('Unable to find loan application');
        if (loanApp.accountId.toString() !== req.user.accountId) throw Boom.forbidden('Missing permissions');

        const files = await FileManagerService.findMany({
          query: {
            _id: {
              $in: loanApp.fileIds,
            },
          },
        }).toArray();

        if (!files.length) throw Boom.notFound('Unable to find any file for this loan application');

        const filesPath = files.map(file => file.filename);
        FileManagerService.archiveFiles({ filesPath, res });
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    /**
    * Get loan estimates for auction id
    * @route GET /loans/applications/estimates/:id
    * @group LoanApp
    * @param {string} id.path.required - id of loan application
    * @returns {array} 200 - loanEstimates array
    * @security jwtToken
    */

    '/estimates/:id',
    async (req, res, next) => {
      try {
        const accountId = req.user.accountId;
        const loanApplicationId = objectId(req.params.id);

        const loanApp = await LoanApplicationRepository.findOne({
          query: { _id: loanApplicationId, accountId },
        });
        if (!loanApp) throw Boom.notFound('Unable to find loan app with provided id');

        const loanEstimates = await LoanEstimateRepository.findMany({
          query: { loanApplicationId, status: 'active' },
        }).toArray();
        if (!loanEstimates.length) throw Boom.notFound('There is no loan estimate for this auction');

        res.json({ loanEstimates });
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    /**
     * Accept LE for borrower's auctions by LE id
     * @route GET /loans/applications/:leId/accept
     * @group LoanApp
     * @param {string} leId.path.required
     * @security jwtToken
     * @returns 200
    */

    '/:leId/accept',
    async (req, res, next) => {
      try {
        const { UserRepository } = req.app.modules.get('net-alignments.users');
        const leId = objectId(req.params.leId);
        const loanEstimate = await LoanEstimateRepository.findOne({ query: { _id: leId } });
        if (!loanEstimate) throw Boom.notFound('Unable to find loan estimate');

        const loanApp = await LoanApplicationRepository.findOne({
          query: { _id: loanEstimate.loanApplicationId },
        });

        if (loanApp.accountId.toString() !== req.user.accountId.toString()) {
          throw Boom.forbidden('Missing permissions. Its not your auction');
        }

        if (loanApp.status !== 'open') throw Boom.badRequest('LE could be accepted only on open auctions');
        await LoanApplicationRepository.updateOne({
          update: { $set: { status: 'accepted', acceptedLenderAccount: loanEstimate.accountId } },
        });

        // eslint-disable-next-line max-len
        const lender = await UserRepository.findOne({ query: { accountId: loanEstimate.accountId } });
        const loosers = await UserRepository.findMany({
          query: { _id: { $in: loanApp.lenders } },
        }).toArray();

        const requests = [];

        requests.push(UserRepository.sendEmail({
          from: 'no-reply@net-alignments.com',
          to: lender.email,
          subject: 'Won loan package!',
          text: `You have just won loan package ${loanApp._id.toString()}. Congratulations!`,
        }));

        loosers.forEach(looser => {
          if (!looser._id.equals(lender._id)) {
            requests.push(UserRepository.sendEmail({
              from: 'no-reply@net-alignments.com',
              subject: 'Loose loan package',
              text: `You have just lost loan package ${loanApp._id.toString()}.`,
              to: looser.email,
            }));
          }
        });

        await Promise.all(requests);

        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    /**
     * Invite lenders to user's loan package
     * @route POST /loans/applications/invite
     * @group LoanApp
     * @param {string} loanApplicationId.body.required - LP id (string or object)
     * @param {string} lenderId.body.required - lender id (string or object)
     * @security jwtToken
     * @returns 200
     */

    '/invite',
    Celebrate({ body: {
      loanApplicationId: Joi.alternatives().try(Joi.string(), Joi.object()).required(),
      lenderId: Joi.alternatives().try(Joi.string(), Joi.object()).required(),
    } }),

    async (req, res, next) => {
      try {
        const { UserRepository } = req.app.modules.get('net-alignments.users');
        const accountId = req.user.accountId;
        const { loanApplicationId, lenderId } = req.body;
        const loanAppId = typeof (loanApplicationId) === 'object' ? loanApplicationId : objectId(loanApplicationId);
        const lendId = typeof (lenderId) === 'object' ? lenderId : objectId(lenderId);

        const loanApp = await LoanApplicationRepository.findOne({ query: { _id: loanAppId, accountId } }); // eslint-disable-line
        if (loanApp.status !== 'open') throw Boom.badRequest('Loan Application must be opened');
        if (!loanAppId) throw Boom.notFound('Unable to find loan application');
        if (loanApp.lenders.includes(lendId.toString())) throw Boom.badRequest('This lender already takes part in your loan app');

        await UserRepository.sendInviteEmail({ lenderId: lendId, loanAppId });
        await LoanApplicationRepository.updateOne({
          query: { _id: loanAppId, accountId },
          update: { $push: { lenders: lendId.toString() } },
        });
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    /**
     * Send message from borrower to accepted lender
     * @route POST /loans/applications/send-message
     * @group LoanApp
     * @param {string} message.body.required - message to send
     * @param {string} loanApplicationId.body.required - loan package id (accepted!)
     * @security jwtToken
     * @returns 200
     */

    '/send-message',
    Celebrate({ body: Joi.object().keys({
      message: Joi.string().required(),
      loanApplicationId: Joi.string().required(),
    }).required() }),

    async (req, res, next) => {
      try {
        const { UserRepository } = req.app.modules.get('net-alignments.users');
        const accountId = req.user.accountId;
        const _id = objectId(req.body.loanApplicationId);

        const loanApp = await LoanApplicationRepository.findOne({ query: { _id, accountId } });
        if (!loanApp) throw Boom.notFound('Unable to find loan package');
        if (loanApp.status !== 'accepted') throw Boom.badRequest('You can send message only to accepted LP');

        // eslint-disable-next-line max-len
        const lender = await UserRepository.findOne({ query: { accountId: loanApp.acceptedLenderAccount } });
        await UserRepository.sendEmail({
          from: 'no-reply@net-alignments.com',
          to: lender.email,
          subject: `Message from ${req.user.username}`,
          text: req.body.message,
        });

        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    /**
     * Rate lender on accepted auction
     * @route POST /loans/applications/rate/:id
     * @group LoanApp
     * @param {number} rate.body.required - min 1, max 5
     * @param {string} message.body.required - min 1, max 5
     * @param {string} id.path.required - loan app id
     * @security jwtToken
     * @returns 200
     */

    '/rate/:id',
    Celebrate({ body: Joi.object().keys({
      rate: Joi.number().min(1).max(5).required(),
      message: Joi.string(),
    }).required() }),

    async (req, res, next) => {
      try {
        const { UserRepository } = req.app.modules.get('net-alignments.users');
        const loanApplicationId = objectId(req.params.id);
        const accountId = req.user.accountId;

        const loanApp = await LoanApplicationRepository.findOne({
          query: { _id: loanApplicationId, accountId },
        });
        if (!loanApp) throw Boom.notFound('Unable to find loan application');
        if (loanApp.status !== 'accepted') throw Boom.badRequest('You can rate only accepted loan app');

        await UserRepository.updateOne({
          query: { accountId: loanApp.acceptedLenderAccount },
          update: { $set: { [`rate.${req.params.id}`]: {
            rate: req.body.rate,
            message: req.body.message,
          } } },
        });

        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
};
