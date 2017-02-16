import Joi from 'joi';
import { generateCRUDRoutes } from 'na-crud';
import { schemas } from 'na-loan';
import pick from 'lodash/pick';
import * as handlers from './handlers';
import crudHandlers from './handlers/crud';
import userSchema from '../../schemas/user';
import accountSchema from '../../schemas/account';

const pathPrefix = '/users';
const generatedCRUDRoutes = generateCRUDRoutes({
  pathPrefix,
  entityName: 'User',
  schema: userSchema,
});

const userCRUDRoutes = [
  'count', 'deleteOne', 'findById', 'findMany', 'findOne', 'replaceOne', 'updateOne',
].reduce((acc, route) => ({
  ...acc,
  [route]: {
    ...generatedCRUDRoutes[route],
    config: {
      ...generatedCRUDRoutes[route].config,
      auth: {
        strategy: 'jwt',
        scope: 'admin',
      },
    },
    handler: crudHandlers[route] || generatedCRUDRoutes[route].handler,
  },
}), {});

export default [{
  path: `${pathPrefix}/register`,
  method: 'POST',
  handler: handlers.register,
  config: {
    validate: {
      payload: Joi.object().keys({
        ...pick(userSchema, [
          'title', 'firstName', 'middleName', 'lastName', 'address', 'password',
          'username', 'email',
        ]),
        ...pick(accountSchema, ['loanOfficersEmails']),
        role: Joi.string().required().valid(['lender', 'borrower', 'broker']),
        loanApplication: Joi.any().when('role', {
          is: 'borrower',
          then: Joi.object().keys(
            pick(schemas.loanApplication, ['financialGoal', 'rate', 'termsByRate']),
          ),
        }),
        licenseNr: Joi.any().when('role', {
          is: Joi.any().valid(['lender', 'broker']),
          then: Joi.number().required(),
        }),
        employeesNr: Joi.number().allow(null),
      }).required(),
    },
    description: 'Register a new user',
    tags: ['api'],
    pre: [{
      method: handlers.validateRegistrationPayload,
    }],
  },
}, {
  path: `${pathPrefix}/refresh-token`,
  method: 'POST',
  handler: handlers.register,
  config: {
    validate: {
      payload: Joi.object().keys({
        token: Joi.string().required(),
      }).required(),
    },
    description: 'Refresh JWT',
    tags: ['api'],
  },
}, {
  path: `${pathPrefix}/reset-password`,
  method: 'POST',
  handler: handlers.resetPassword,
  config: {
    validate: {
      payload: Joi.object().keys({
        usernameOrEmail: Joi.string(),
      }).required(),
    },
    description: 'Reset password',
    tags: ['api'],
  },
}, {
  path: `${pathPrefix}/recover-password/{token}`,
  method: 'POST',
  handler: handlers.recoverPassword,
  config: {
    validate: {
      params: Joi.object().keys({
        token: Joi.string().required(),
      }).required(),
      payload: Joi.object().keys({
        password: Joi.string().required(),
      }).required(),
    },
    description: 'Recover password',
    tags: ['api'],
  },
}, {
  path: `${pathPrefix}/change-password`,
  method: 'POST',
  handler: handlers.changePassword,
  config: {
    auth: 'jwt',
    validate: {
      payload: Joi.object().keys({
        oldPassword: Joi.string().required(),
        password: Joi.string().required(),
      }).required(),
    },
    description: 'Change password',
    tags: ['api'],
  },
}, {
  path: `${pathPrefix}/me`,
  method: 'GET',
  handler: handlers.getProfile,
  config: {
    auth: 'jwt',
    description: 'User profile',
    tags: ['api'],
  },
}, {
  path: `${pathPrefix}/me`,
  method: 'PATCH',
  handler: handlers.updateProfile,
  config: {
    auth: 'jwt',
    description: 'Update user profile',
    tags: ['api'],
    validate: {
      payload: {
        ...pick(userSchema, [
          'title', 'firstName', 'middleName', 'lastName', 'address',
        ]),
        address: userSchema.address.optional(),
      },
    },
  },
}].concat(
  Object.keys(userCRUDRoutes).map((routeName) => userCRUDRoutes[routeName]),
);
