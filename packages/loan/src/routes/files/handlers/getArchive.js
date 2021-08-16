import Boom from 'boom';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

export default async function (request, reply) {
  const { FileEntity } = this;
  const { loanApplication } = request.pre;

  try {
    const files = await FileEntity.findMany({
      query: {
        _id: {
          $in: loanApplication.fileIds,
        },
      },
    }).then((c) => c.toArray());

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
