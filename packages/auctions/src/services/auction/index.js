import * as handlers from './handlers';

const entityNamespace = 'entity.Auction';

export default ({
  dispatcher,
}) => {
  const { subscribeMap } = dispatcher;
  subscribeMap(entityNamespace, handlers);
};
