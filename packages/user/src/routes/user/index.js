import Joi from 'joi';
import Boom from 'boom';
import * as handlers from './handlers';

export default [{
  path: '/user/register',
  method: 'POST',
  handler: {
    dispatch: {
      event: 'User.register',
      buildParams({ payload }) {
        return payload;
      },
    },
  },
  config: {
    validate: {
      payload: Joi.object().keys({
        username: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
      }).required(),
    },
    description: 'Register a new user',
    tags: ['api'],
  },
}, {
  path: '/user/reset-password',
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
  path: '/user/recover-password/{token}',
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
  path: '/social-login/facebook',
  method: ['GET', 'POST'],
  handler: handlers.socialLogin,
  config: {
    auth: 'facebook',
  },
}, {
  path: '/social-login/google',
  method: ['GET', 'POST'],
  handler: handlers.socialLogin,
  config: {
    auth: 'google',
  },
}];
