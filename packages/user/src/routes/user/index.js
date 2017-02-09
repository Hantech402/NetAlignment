import Joi from 'joi';
import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';
import { generateCRUDRoutes } from 'na-crud';
import { schemas } from 'na-loan';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
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
      async method(request, reply) {
        const { AccountEntity } = this;
        const { role, licenseNr } = request.payload;
        if (role === 'lender') {
          const brokerAccount = await AccountEntity.findOne({
            query: { licenseNr },
          });

          if (
            brokerAccount &&
            (brokerAccount.loanOfficersEmails >= brokerAccount.employeesNr)
          ) {
            reply(Boom.badRequest('Loan officers spots are at full!'));
          }

          Object.assign(request.payload, {
            brokerAccountId: brokerAccount._id,
          });
        }

        reply();
      },
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
  path: `${pathPrefix}/recover-password/{token}`,
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
  path: `${pathPrefix}/change-password`,
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
}, {
  path: `${pathPrefix}/me`,
  method: 'GET',
  async handler(request, reply) {
    const { UserEntity } = this;

    try {
      const userId = objectId(request.auth.credentials.id);
      const user = await UserEntity.findById(userId);
      const result = omit(user, ['password', 'salt']);
      reply(result);
    } catch (err) {
      reply(Boom.wrap(err));
    }
  },
  config: {
    auth: 'jwt',
    description: 'User profile',
    tags: ['api'],
  },
}, {
  path: `${pathPrefix}/me`,
  method: 'PATCH',
  async handler(request, reply) {
    const { UserEntity } = this;
    const userId = objectId(request.auth.credentials.id);
    const data = request.payload;

    try {
      const user = await UserEntity.findById(userId);
      await UserEntity.updateOne({
        query: {
          _id: userId,
        },
        update: {
          $set: data,
        },
      });

      reply(
        omit({
          ...user,
          ...data,
        }, ['password', 'salt']),
      );
    } catch (err) {
      reply(Boom.wrap(err));
    }
  },
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
