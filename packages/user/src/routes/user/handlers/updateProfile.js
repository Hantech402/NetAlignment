import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';
import omit from 'lodash/omit';

export default async function (request, reply) {
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
}
