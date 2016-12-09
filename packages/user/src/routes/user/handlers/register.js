import Boom from 'boom';
import omit from 'lodash/omit';

export default async function handler(request, reply) {
  const { User, AuctionEntity } = this;
  const { payload } = request;
  const { auction } = payload;
  const userData = omit(payload, ['auction']);

  try {
    const result = await User.register(userData);
    const { user, account } = result;

    if (user.role === 'borrower' && auction) {
      await AuctionEntity.createOne({
        ...auction,
        status: 'draft',
        accountId: account._id,
      });
    }

    return reply(result);
  } catch (err) {
    return reply(Boom.wrap(err));
  }
}
