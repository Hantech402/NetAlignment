import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';

export default async function (request, reply) {
  const { FileEntity } = this;
  const { uploadedFile } = request.pre;
  const userId = objectId(request.auth.credentials.id);
  const accountId = objectId(request.auth.credentials.accountId);

  try {
    const file = await FileEntity.createFromUpload({
      ...uploadedFile,
      accountId,
      userId,
    });

    reply(file);
  } catch (err) {
    reply(Boom.wrap(err));
  }
}
