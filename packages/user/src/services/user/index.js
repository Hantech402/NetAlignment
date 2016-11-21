import omit from 'lodash/omit';
import * as handlers from './handlers';

const entityNamespace = 'entity.User';

export default ({
  dispatcher,
}) => {
  const { subscribeMap, subscribe } = dispatcher;
  subscribeMap(entityNamespace, omit(handlers, ['serialize']));
  subscribe('User.serialize', handlers.serialize);
  subscribe('User.register', handlers.register);
  subscribe('User.login', handlers.login);
  subscribe('User.resetPassword', handlers.resetPassword);
  subscribe('User.recoverPassword', handlers.recoverPassword);
  subscribe('User.socialLogin', handlers.socialLogin);
  subscribe('User.dump', handlers.dump);
};
