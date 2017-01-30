import Boom from 'boom';

export default async function (request, reply) {
  const { FileEntity } = this;
  const { file } = request.pre;

  try {
    const filePath = await FileEntity.getPath(file);

    return reply.file(filePath, {
      confine: false,
      filename: file.filename,
      mode: 'attachment',
    });
  } catch (err) {
    return reply(Boom.wrap(err));
  }
}
