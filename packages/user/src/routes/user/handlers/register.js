import Boom from 'boom';
import omit from 'lodash/omit';

export default async function handler(request, reply) {
  const { User, LoanApplicationEntity } = this;
  const { payload } = request;
  const { loanApplication } = payload;
  const userData = omit(payload, ['loanApplication']);

  try {
    const result = await User.register(userData);
    const { user, account } = result;

    if (user.role === 'borrower' && loanApplication) {
      await LoanApplicationEntity.createOne({
        ...loanApplication,
        status: 'draft',
        accountId: account._id,
      });
    }

    return reply(result);
  } catch (err) {
    return reply(Boom.wrap(err));
  }
}
