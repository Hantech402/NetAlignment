import { Repository } from 'makeen-mongodb';
import { decorators } from 'octobus.js';
import bcrypt from 'bcrypt';
import Boom from 'boom';
import jwt from 'jsonwebtoken';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import { ObjectID as objectId } from 'mongodb';

import userSchema from '../schemas/userSchema';

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

const { service } = decorators;
// const { idToQuery } = helpers;

export class UserRepositoryService extends Repository {
  constructor({ jwtSecret, AccountRepository }) {
    super(userSchema);
    this.jwtSecret = jwtSecret;
    this.AccountRepository = AccountRepository;
  }

  setServiceBus(serviceBus) {
    super.setServiceBus(serviceBus);
  }

  @service()
  generateToken({ userData, accountId }) { // eslint-disable-line class-methods-use-this
    const user = { ...userData, _id: userData._id.toString() };
    return new Promise((resolve, reject) => {
      jwt.sign({
        ...pick(user, ['_id', 'username', 'accountId']),
        scope: user.role,
        accountId,
      }, this.jwtSecret, { expiresIn: '1d' }, (err, token) => {
        if (err) reject(err);
        resolve(token);
      });
    });
  }

  @service()
  register(userData) {
    return super.findOne({ query: { email: userData.email } })
      .then(user => {
        if (user && user.username === userData.username) throw Boom.badRequest('This username is already taken');
        if (user && user.email === userData.email) throw Boom.badRequest('This email is already taken');
        return hashPassword(userData.password);
      })
      .then(hashedPassword => super.createOne({ ...userData, password: hashedPassword }));
  }

  @service()
  login({ username, password }) {
    let userObj;
    return super.findOne({ query: { username } })
      .then(user => {
        if (!user) throw Boom.badRequest('Wrong username provided');
        userObj = user;
        return bcrypt.compare(password, user.password);
      })
      .then(validPassword => {
        if (!validPassword) throw Boom.badRequest('Wrong password');
        return this.AccountRepository.findOne({ query: { ownerId: userObj._id } });
      })
      .then(account => {
        if (!account.isConfirmed) throw Boom.unauthorized('Your account is not confirmed');
      })
      .then(() => super.updateOne({
        query: { _id: userObj._id },
        update: { $set: { lastLogin: new Date() } },
      }))
      .then(() => userObj);
  }

  @service()
  getUserProfile(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.jwtSecret, (err, decoded) => {
        if (err) reject(err);
        const userId = objectId(decoded._id);
        super.findOne({ query: { _id: userId } })
          .then(user => {
            if (!user) reject(Boom.badRequest('Something went wrong. This user doesn\'t exits'));
            resolve(omit(user, ['password']));
          })
          .catch(reject);
      });
    });
  }

  @service()
  getAllUsers() {
    return super.findMany({
      query: {},
      fields: { password: 0 },
    }).toArray();
  }

  @service()
  getById(id) {
    return super.findOne({
      query: { _id: objectId(id) },
      options: {
        fields: {
          password: 0,
        },
      },
    })
      .then(user => {
        if (!user) throw Boom.badRequest('Wrong id provided');
        return user;
      });
  }

  @service()
  updateProfile({ userId, newData }) {
    return super.updateOne({
      query: { _id: objectId(userId) },
      update: { $set: newData },
      options: { new: true, projection: { password: 0 } },
    });
  }
}
