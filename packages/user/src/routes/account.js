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
        id: Joi.string().required(),
      },
    },
    description: 'Confirm account',
    tags: ['api'],
  },
}];
