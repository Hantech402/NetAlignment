import Joi from 'joi';
import Boom from 'boom';
import { generateCRUDRoutes } from 'na-crud';
import { schemas } from 'na-auctions';
import pick from 'lodash/pick';
import * as handlers from './handlers';
import crudHandlers from './handlers/crud';
import userSchema from '../../schemas/user';

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
  // handler: {
  //   dispatch: {
  //     event: 'User.register',
  //     buildParams({ payload }) {
  //       return payload;
  //     },
  //   },
  // },
  handler: handlers.register,
  config: {
    validate: {
      payload: Joi.object().keys({
        ...pick(userSchema, [
          'title', 'firstName', 'middleName', 'lastName', 'address', 'password',
          'username', 'email',
        ]),
        role: Joi.string().required().valid(['lender', 'borrower']),
        auction: Joi.any().when('role', {
          is: 'borrower',
          then: Joi.object().keys(
            pick(schemas.auction, ['financialGoal', 'rate', 'termsByRate']),
          ),
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
// }, {
//   path: '/social-login/facebook',
//   method: ['GET', 'POST'],
//   handler: handlers.socialLogin,
//   config: {
//     auth: 'facebook',
//   },
// }, {
//   path: '/social-login/google',
//   method: ['GET', 'POST'],
//   handler: handlers.socialLogin,
//   config: {
//     auth: 'google',
//   },
}].concat(
  Object.keys(userRoutes)
    .filter((routeName) => routeName !== 'createOne')
    .map((routeName) => userRoutes[routeName]),
);
