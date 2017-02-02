import Boom from 'boom';

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

    return reply(files);
  } catch (err) {
    return reply(Boom.wrap(err));
  }
}
