import { Repository } from 'makeen-mongodb';
import { decorators } from 'octobus.js';
import bcrypt from 'bcrypt';
import Boom from 'boom';
import jwt from 'jsonwebtoken';
import pick from 'lodash/pick';
import bluebird from 'bluebird';
import { ObjectID as objectId } from 'mongodb';
import nodemailer from 'nodemailer';

import userSchema from '../schemas/userSchema';

const verifyJwt = bluebird.promisify(jwt.verify);

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

const { service } = decorators;

export class UserRepositoryService extends Repository {
  constructor({ config, AccountRepository }) {
    super(userSchema);
    this.jwtSecret = config.jwtSecret;
    this.AccountRepository = AccountRepository;
    this.transport = nodemailer.createTransport(config.nodemailerConfig);
    this.apiUrl = config.rootURL;
    this.jwtExpiresIn = config.jwtExpiresIn;
  }

  setServiceBus(serviceBus) {
    super.setServiceBus(serviceBus);
  }

  @service()
  generateToken({ userData }) { // eslint-disable-line class-methods-use-this
    return new Promise((resolve, reject) => {
      jwt.sign({
        ...pick(userData, ['_id', 'username', 'accountId']),
        scope: userData.role,
      }, this.jwtSecret, { expiresIn: this.jwtExpiresIn }, (err, token) => {
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
  verifyCredentials({ username, password }) {
    let userObj;
    return super.findOne({ query: { username } })
      .then(user => {
        if (!user) throw Boom.badRequest('Wrong username provided');
        userObj = user;
        return bcrypt.compare(password, user.password);
      })
      .then(validPassword => {
        if (!validPassword) throw Boom.badRequest('Wrong password');
        return userObj;
      });
  }

  @service()
  login({ username, password }) {
    let userObj;
    return this.verifyCredentials({ username, password })
      .then(user => {
        userObj = user;
        return this.AccountRepository.findOne({ query: { ownerId: userObj._id } });
      })
      .then(account => {
        if (!account.isConfirmed) throw Boom.unauthorized('Your account is not confirmed');
        if (account.isDeactivated) throw Boom.unauthorized('Your account is deactivated');
      })
      .then(() => super.updateOne({
        query: { _id: userObj._id },
        update: { $set: { lastLogin: new Date() } },
      }))
      .then(() => userObj);
  }

  @service()
  refreshToken({ token }) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.jwtSecret, (jwtErr, decoded) => {
        if (!jwtErr) return resolve(this.generateToken({ userData: decoded }));
        if (jwtErr.name !== 'TokenExpiredError') return reject(jwtErr);
        const userData = jwt.decode(token);
        return resolve(this.generateToken({ userData }));
      });
    });
  }

  @service()
  updateProfile({ userId, data }) {
    return super.updateOne({
      query: { _id: objectId(userId) },
      update: { $set: data },
      options: { new: true, projection: { password: 0 } },
    });
  }

  @service()
  changePassword({ userId, password }) {
    return hashPassword(password)
      .then(hashedPassword => super.updateOne({
        query: { _id: objectId(userId) },
        update: { $set: { password: hashedPassword } },
      }));
  }

  @service()
  updatePasswordWithToken({ token, password }) {
    let userObj;
    return super.findOne({ query: { 'resetPassword.token': token } })
      .then(user => {
        if (!user) throw Boom.badRequest('Wrong token');
        userObj = user;
        return bcrypt.compare(password, user.password);
      })
      .then(samePassword => {
        if (samePassword) throw Boom.badRequest('You can\'t use the same password');
        return hashPassword(password);
      })
      .then(hashedPassword => super.updateOne({
        query: { _id: userObj._id },
        update: { $set: { password: hashedPassword, resetPassword: {} } },
      }));
  }

  @service()
  findByUsernameOrEmail({ usernameOrEmail }) {
    return super.findOne({ query: {
      $or: [{
        username: usernameOrEmail,
      }, {
        email: usernameOrEmail,
      }],
    } });
  }

  @service()
  sendEmail(options) {
    return this.transport.sendMail(options);
  }

  @service()
  sendConfirmationEmail({ email, accountId }) {
    return this.sendEmail({
      from: 'no-reply@mail.com',
      to: email,
      subject: 'Email confirmation',
      html: `Please confirm your email <a href='${this.apiUrl}/account/${accountId}/confirm'>Click here to confirm</a>`,
    });
  }
}
