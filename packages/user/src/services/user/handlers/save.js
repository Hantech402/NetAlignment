import { decorators } from 'octobus.js';

const { withLookups } = decorators;

const handler = async ({ params, next, User, Account }) => {
  let previousData;
  const isCreate = !params._id;

  if (!isCreate) {
    previousData = await User.findById(params._id);
  }

  const shouldAcknowledgeOwner = (
    isCreate ||
    (params.accountId.toString() !== previousData.accountId.toString())
  );

  const user = await next(params);

  if (shouldAcknowledgeOwner) {
    await Account.updateOne({
      query: {
        _id: user.accountId,
      },
      update: {
        $set: {
          ownerId: user._id,
        },
      },
    });
  }

  return user;
};

export default withLookups({
  Account: 'entity.Account',
  User: 'entity.User',
})(handler);
