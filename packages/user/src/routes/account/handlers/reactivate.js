import Boom from 'boom';

export default async function (request, reply) {
  const { account } = request.pre;
  const { AccountEntity } = this;

  try {
    if (!account.isDeactivated) {
      return reply(Boom.badRequest('This account is not deactivated!'));
    }

    await AccountEntity.updateOne({
      query: {
        _id: account._id,
      },
      update: {
        $set: {
          isDeactivated: false,
        },
      },
    });

    return reply({
      ok: true,
    });
  } catch (err) {
    return reply(Boom.wrap(err));
  }
}
