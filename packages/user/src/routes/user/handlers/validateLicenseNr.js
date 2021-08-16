import Boom from 'boom';

export default async function (request, reply) {
  const { AccountEntity } = this;
  const { role, licenseNr } = request.payload;
  if (role === 'broker') {
    const account = await AccountEntity.findOne({
      query: { licenseNr },
    });

    if (account) {
      return reply(Boom.badRequest('License nr already registered!'));
    }
  }

  if (role === 'lender') {
    const brokerAccount = await AccountEntity.findOne({
      query: { licenseNr },
    });

    if (brokerAccount) {
      return reply(brokerAccount);
    }
  }

  return reply();
}
