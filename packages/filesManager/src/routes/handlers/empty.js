import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';

export default async function (request, reply) {
  const { FileEntity } = this;
  const accountId = objectId(request.auth.credentials.accountId);

  try {
    await FileEntity.deleteMany({
      query: {
        accountId,
      },
    });

    reply({
      ok: true,
    });
  } catch (err) {
    reply(Boom.wrap(err));
  }
}
