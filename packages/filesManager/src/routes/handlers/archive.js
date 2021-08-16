import Boom from 'boom';
import archiver from 'archiver';
import fs from 'fs';
import { ObjectID as objectId } from 'mongodb';
import path from 'path';

export default async function (request, reply) { // eslint-disable-line
  const { FileEntity } = this;
  const accountId = objectId(request.auth.credentials.id);

  try {
    const files = await FileEntity.findMany({
      query: {
        accountId,
      },
    }).then((c) => c.toArray());

    if (!files.length) {
      return reply(null);
    }

    const archive = archiver('zip', {
      store: true,
    });

    await Promise.all(
      files.map(async (file) => {
        const filePath = await FileEntity.getPath(file);
        archive.append(
          fs.createReadStream(path.resolve(filePath)),
          { name: file.filename },
        );
      }),
    );

    reply(archive).header('Content-Disposition', 'attachment; filename=archive.zip');

    archive.finalize();
  } catch (err) {
    reply(Boom.wrap(err));
  }
}
