import Boom from 'boom';

export default async function (request, reply) {
  const { FileEntity } = this;
  const { file } = request.pre;
  const { _id } = file;

  try {
    const result = FileEntity.deleteOne({ query: { _id } });
    reply(result);
  } catch (err) {
    reply(Boom.wrap(err));
  }
}
