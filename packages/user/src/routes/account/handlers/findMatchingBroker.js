import Boom from 'boom';
import pick from 'lodash/pick';

export default async function (request, reply) {
  const { AccountEntity, UserEntity } = this;
  const { licenseNr } = request.params;

  try {
    const account = await AccountEntity.findOne({
      query: {
        licenseNr,
        isActive: true,
        isDeactivated: false,
        isConfirmed: true,
      },
    });

    if (!account) {
      return reply(Boom.notFound('Unable to find account!'));
    }

    const user = await UserEntity.findOne({
      query: {
        accountId: account._id,
        role: 'broker',
        isAccountOwner: true,
      },
    });

    if (!user) {
      return reply(Boom.notFound('Unable to find account!'));
    }

    return reply({
      accountId: account._id,
      userId: user._id,
      ...pick(user, ['firstName', 'middleName', 'lastName']),
    });
  } catch (err) {
    return reply(Boom.wrap(err));
  }
}
