import Boom from 'boom';

export default async function (request, reply) {
  const { FileEntity } = this;
  const { fileId } = request.params;
  const { loanApplication, file } = request.pre;

  try {
    const isValid = loanApplication.fileIds.find((id) => id.toString() === fileId.toString());

    if (!isValid) {
      return reply(Boom.notFound(`Unable to find file with id ${fileId}`));
    }

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
