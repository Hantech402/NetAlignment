import Boom from 'boom';
import pick from 'lodash/pick';

export default async function (request, reply) {
  const { AccountEntity, UserEntity } = this;
  const { licenseNr, employeeEmail } = request.query;

  try {
    const query = {
      isActive: true,
      isDeactivated: false,
      isConfirmed: true,
    };

    if (licenseNr) {
      query.licenseNr = licenseNr;
    }

    if (employeeEmail) {
      query.loanOfficersEmails = employeeEmail;
    }

    const account = await AccountEntity.findOne({ query });

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
