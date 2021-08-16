import Boom from 'boom';

export default async function (request, reply) {
  const { role, email } = request.payload;
  if (!role === 'lender') {
    return reply();
  }

  const { brokerAccount } = request.pre;

  /**
   * TODO
   * check if lender.email is to be found through brokerAccount.loanOfficersEmails
   * Should the api reject a lender registration if (1) a broker has a matching licenseNr,
   * (2) that broker has a number of employee emails equal to their employeesNr, and (3)
   * the lender’s email isn’t on the list?
   */
  if (brokerAccount) {
    if (
      brokerAccount &&
      (brokerAccount.loanOfficersEmails >= brokerAccount.employeesNr)
    ) {
      return reply(Boom.badRequest('Loan officers spots are at full!'));
    }

    if (!brokerAccount.loanOfficersEmails.includes(email)) {
      return reply(Boom.badRequest('This email cannot be found in the list of this broker\'s loan officers\' emails!'));
    }

    Object.assign(request.payload, {
      brokerAccountId: brokerAccount._id,
    });
  }

  return reply();
}
