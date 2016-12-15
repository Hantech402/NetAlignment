import Joi from 'joi';
import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';
import { generateCRUDRoutes } from 'na-crud';
import { schemas } from 'na-auctions';
import pick from 'lodash/pick';
import * as handlers from './handlers';
import crudHandlers from './handlers/crud';
import userSchema from '../../schemas/user';
import accountSchema from '../../schemas/account';

const prefix = '/users';
const generatedCRUDRoutes = generateCRUDRoutes('entity.User', userSchema, '/users');
const userRoutes = {
  ...generatedCRUDRoutes,
  deleteOne: {
    ...generatedCRUDRoutes.deleteOne,
    config: {
      ...generatedCRUDRoutes.deleteOne.config,
      auth: 'jwt',
    },
    handler: crudHandlers.deleteOne,
  },
};

export default [{
  path: `${prefix}/register`,
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
        role: Joi.string().required().valid(['lender', 'borrower']),
        auction: Joi.any().when('role', {
          is: 'borrower',
          then: Joi.object().keys(
            pick(schemas.auction, ['financialGoal', 'rate', 'termsByRate']),
          ),
        }),
        licenseNr: Joi.any().when('role', {
          is: 'lender',
          then: Joi.number().required(),
        }),
      }).required(),
    },
    description: 'Register a new user',
    tags: ['api'],
  },
}, {
  path: `${prefix}/reset-password`,
  method: 'POST',
  async handler(request, reply) {
    const { User } = this;
    const { usernameOrEmail } = request.payload;
    try {
      const { user, updateResult } = await User.resetPassword(usernameOrEmail);
      const curatedUser = await User.dump(user);
      reply({
        user: curatedUser,
        updateResult,
      });
    } catch (err) {
      reply(Boom.wrap(err));
    }
  },
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
  path: `${prefix}/recover-password/{token}`,
  method: 'POST',
  async handler(request, reply) {
    const { User } = this;
    const { password } = request.payload;
    const { token } = request.params;
    try {
      const { user, updateResult } = await User.recoverPassword({ password, token });
      const curatedUser = await User.dump(user);
      reply({
        user: curatedUser,
        updateResult,
      });
    } catch (err) {
      reply(Boom.wrap(err));
    }
  },
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
  path: `${prefix}/change-password`,
  method: 'POST',
  async handler(request, reply) {
    const { User } = this;
    const { oldPassword, password } = request.payload;
    try {
      reply(await User.changePassword({
        password,
        oldPassword,
        userId: objectId(request.auth.credentials.id),
      }));
    } catch (err) {
      reply(Boom.wrap(err));
    }
  },
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
}].concat(
  Object.keys(userRoutes)
    .filter((routeName) => routeName !== 'createOne')
    .map((routeName) => userRoutes[routeName]),
);
