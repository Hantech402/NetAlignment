import Joi from 'joi';
import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';

export default [{
  path: '/account/{id}/confirm',
  method: 'GET',
  async handler(request, reply) {
    const { AccountEntity } = this;
    const { id } = request.params;

    try {
      const account = await AccountEntity.findById(objectId(id));
      if (!account) {
        return reply(Boom.notFound(`Unable to find account with id ${id}.`));
      }

      await AccountEntity.updateOne({
        query: {
          _id: objectId(id),
        },
        update: {
          $set: {
            isConfirmed: true,
          },
        },
      });

      return reply(account);
    } catch (err) {
      return reply(Boom.wrap(err));
    }
  },
  config: {
    validate: {
      params: {
        id: Joi.string().required(),
      },
    },
    description: 'Confirm account',
    tags: ['api'],
  },
}];
