import setupUserServices from './user/index';
import setupAccountServices from './account/index';

export default (options) => {
  setupUserServices(options);
  setupAccountServices(options);
};
