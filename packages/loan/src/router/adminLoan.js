import { Router } from 'express';
import { ObjectID as objectId } from 'mongodb';
import Boom from 'boom';
import Celebrate from 'celebrate';
import Joi from 'joi';

export const adminLoanRouter = config => {
  const {
    router = Router(),
    permissions,
    LoanApplicationRepository,
    FileManagerService,
    LoanEstimateRepository,
  } = config;

  router.use(permissions.requireAuth, permissions.requireAdmin);

  router.get(
    /**
     * Get loan applications (by admin only)
     * @route GET /loans/admin/applications
     * @group LoanAppAdmin
     * @param {string} status.query.required - valid 'open' and 'accepted' or nothing
     * @returns {array} 200 - array of loan apps
     * @security jwtToken
     */

    '/applications',
    Celebrate({ query: Joi.object().keys({
      status: Joi.string().valid(['open', 'accepted', 'closed']),
    }) }),
    async (req, res, next) => {
      try {
        const status = req.query.status;
        const loanApps = await LoanApplicationRepository.findMany({
          query: { status },
        }).toArray();

        res.json(loanApps);
      } catch (err) {
        next(err);
      }
    },
  );

  router.patch(
    /**
     * Update opened auction by admin
     * @route PATCH /loans/admin/applications/:id
     * @group LoanAppAdmin
     * @param {string} id.path.required
     * @returns - 200
     * @security jwtToken
    */

    '/applications/:id',
    Celebrate({ body: Joi.object().required() }),
    async (req, res, next) => {
      try {
        const _id = objectId(req.params.id);
        const result = await LoanApplicationRepository.updateOne({
          query: { _id, status: 'open' },
          update: { $set: req.body },
        });

        if (!result) throw Boom.notFound('Unable to find loan app');
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.delete(
    /**
     * Delete open auction by admin
     * @route DELETE /loans/admin/applications/{id}
     * @group LoanAppAdmin
     * @param {string} id.path.required - loan app id
     * @returns 200 - status code
     * @security jwtToken
    */

    '/applications/:id',
    async (req, res, next) => {
      try {
        const _id = objectId(req.params.id);
        const result = await LoanApplicationRepository.deleteOne({ query: { _id, status: 'open' } });
        if (!result) throw Boom.notFound('Unable to find open auction with provided id');

        if (result.fileIds.length) {
          await FileManagerService.deleteMany({ query: { _id: { $in: result.fileIds } } });
        }

        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
};
