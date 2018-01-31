import pick from 'lodash/pick';

export const setUserInfo = user =>
  pick(user, ['accountId', 'lastLogin', '_id', 'title', 'email', 'username', 'role', 'address', 'isActive', 'createdAt', 'updatedAt']);
