import Boom from 'boom';

export default async function (request, reply) {
  const { AccountEntity, User } = this;
  const { payload } = request;

  try {
    const user = await User.login({
      ...payload,
      skipDeactivationCheck: true,
    });

    const account = await AccountEntity.findById(user.accountId);

    if (!account) {
      return reply(Boom.badRequest('Unable to find account!'));
    }

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

    return reply(await User.dump(user));
  } catch (err) {
    return reply(Boom.wrap(err));
  }
}
