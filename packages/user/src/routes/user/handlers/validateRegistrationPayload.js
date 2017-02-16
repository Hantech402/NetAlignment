import Boom from 'boom';

export default async function (request, reply) {
  const { AccountEntity } = this;
  const { role, licenseNr } = request.payload;
  if (role === 'lender') {
    const brokerAccount = await AccountEntity.findOne({
      query: { licenseNr },
    });

    /**
     * TODO
     * check if lender.email is to be found through brokerAccount.loanOfficersEmails
     */
    if (
      brokerAccount &&
      (brokerAccount.loanOfficersEmails >= brokerAccount.employeesNr)
    ) {
      reply(Boom.badRequest('Loan officers spots are at full!'));
    }

    Object.assign(request.payload, {
      brokerAccountId: brokerAccount._id,
    });
  }

  reply();
}
