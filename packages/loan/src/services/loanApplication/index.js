import { generateCRUDServices } from 'octobus-mongodb';
import * as handlers from './handlers';
import schema from '../../schemas/loanApplication';

const entityNamespace = 'entity.LoanApplication';

export default ({
  dispatcher, db, refManager,
}) => {
  const { subscribeMap } = dispatcher;

  subscribeMap(entityNamespace,
    generateCRUDServices(dispatcher, entityNamespace, {
      db,
      schema,
      refManager,
    },
  ));

  subscribeMap(entityNamespace, handlers);
};
