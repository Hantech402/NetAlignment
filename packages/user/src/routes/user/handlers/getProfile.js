import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';
import omit from 'lodash/omit';

export default async function (request, reply) {
  const { UserEntity } = this;

  try {
    const userId = objectId(request.auth.credentials.id);
    const user = await UserEntity.findById(userId);
    const result = omit(user, ['password', 'salt']);
    reply(result);
  } catch (err) {
    reply(Boom.wrap(err));
  }
}
