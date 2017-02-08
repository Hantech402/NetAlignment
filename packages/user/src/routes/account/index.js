import Joi from 'joi';
import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';
import findMany from 'na-crud/src/libs/routes/findMany';
import objectIdValidator from 'na-core/src/schemas/objectId';

const findManyFiles = findMany({
  entityName: 'File',
});

export default [{
  path: '/account/{id}/confirm',
  method: 'GET',
  async handler(request, reply) {
    const { AccountEntity } = this;
    const { id } = request.params;

    try {
      const account = await AccountEntity.confirm({
        _id: objectId(id),
      });

      return reply(account);
    } catch (err) {
      return reply(Boom.wrap(err));
    }
  },
  config: {
    validate: {
      params: {
        id: objectIdValidator.required(),
      },
    },
    description: 'Confirm account',
    tags: ['api'],
  },
}, {
  path: '/account/deactivate',
  method: 'POST',
  async handler(request, reply) {
    const { AccountEntity } = this;
    const accountId = objectId(request.auth.credentials.accountId);
    const { reason } = request.payload;

    try {
      reply(
        AccountEntity.deactivate({
          _id: accountId,
          reason,
        }),
      );
    } catch (err) {
      reply(Boom.wrap(err));
    }
  },
  config: {
    auth: {
      strategy: 'jwt',
      scope: 'borrower',
    },
    validate: {
      payload: {
        reason: Joi.string().required(),
      },
    },
    description: 'Deactivate account',
    tags: ['api'],
  },
}, {
  path: '/account/activate',
  method: 'POST',
  async handler(request, reply) {
    const { AccountEntity } = this;
    const accountId = objectId(request.auth.credentials.accountId);

    try {
      await AccountEntity.updateOne({
        query: {
          _id: accountId,
        },
        update: {
          $set: {
            isDeactivated: false,
          },
        },
      });

      reply({
        ok: true,
      });
    } catch (err) {
      reply(Boom.wrap(err));
    }
  },
  config: {
    auth: {
      strategy: 'jwt',
      scope: 'borrower',
    },
    description: 'Activate account',
    tags: ['api'],
  },
}, {
  path: '/account/resend-activation-email',
  method: 'POST',
  async handler(request, reply) {
    const { AccountEntity } = this;
    const { email } = request.payload;

    try {
      await AccountEntity.resendActivationEmail({ email });
      return reply({
        ok: true,
      });
    } catch (err) {
      return reply(Boom.wrap(err));
    }
  },
  config: {
    validate: {
      payload: Joi.object().keys({
        email: Joi.string().required().email(),
      }),
    },
    description: 'Resend activation email',
    tags: ['api'],
  },
}, {
  ...findManyFiles,
  path: '/account/files',
  config: {
    ...findManyFiles.config,
    pre: [
      ...findManyFiles.config.pre,
      {
        method(request, reply) {
          const { queryParams } = request.pre;
          queryParams.query.accountId = objectId(request.auth.credentials.accountId);
          reply();
        },
      },
    ],
    auth: 'jwt',
    description: 'Get all the files of an account',
    tags: ['api'],
  },
}];
