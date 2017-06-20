/* eslint-disable class-methods-use-this */
import UserService from 'makeen-user/build/services/User';
import { pick, omit } from 'lodash';
import { decorators } from 'octobus.js';

const { service } = decorators;

export default class NetAlignUserService extends UserService {
  @service()
  serialize(data) {
    return {
      id: data._id.toString(),
      username: data.username,
      accountId: data.accountId,
      scope: [data.role],
    };
  }

  @service()
  dump(data) {
    return pick(data, [
      'accountId',
      'username',
      'firstName',
      'lastName',
      'email',
      '_id',
      'updatedAt',
      'createdAt',
      'token',
      'labels',
      'lastLogin',
      'role',
      'address',
    ]);
  }

  @service()
  async validateLicenseNumber(role, licenseNr) {
    const { AccountRepository } = this;
    if (role === 'broker') {
      const account = await AccountRepository.findOne({
        query: { licenseNr },
      });

      if (account) {
        throw new Error('License nr already registered!');
      }
    }

    if (role === 'lender') {
      const brokerAccount = await AccountRepository.findOne({
        query: { licenseNr },
      });

      if (brokerAccount) {
        return brokerAccount;
      }
    }

    return null;
  }

  @service()
  async validateLenderRegistration(role, email, brokerAccount) {
    /**
     * TODO
     * check if lender.email is to be found through brokerAccount.loanOfficersEmails
     * Should the api reject a lender registration if (1) a broker has a matching licenseNr,
     * (2) that broker has a number of employee emails equal to their employeesNr, and (3)
     * the lender’s email isn’t on the list?
     */
    if (!brokerAccount) {
      return null;
    }

    const tooManyOfficers = brokerAccount &&
      brokerAccount.loanOfficersEmails >= brokerAccount.employeesNr;
    if (tooManyOfficers) {
      throw new Error('Loan officers spots are at full!');
    }

    const unknownEmail = !brokerAccount.loanOfficersEmails.includes(email);
    if (unknownEmail) {
      throw new Error(
        "This email cannot be found in the list of this broker's loan officers' emails!",
      );
    }

    return { brokerAccountId: brokerAccount._id };
  }

  @service()
  async register(
    {
      username,
      email,
      licenseNr,
      loanOfficersEmails,
      brokerAccountId,
      employeesNr,
      role,
      ...userParams
    },
    { publish },
  ) {
    const { UserRepository, AccountRepository } = this;

    if (role === 'broker' && loanOfficersEmails.length > employeesNr) {
      throw new Error(
        'Employees number is smaller than the provided loan officers emails!',
      );
    }

    const existingUser = await UserRepository.findOne({
      query: {
        $or: [
          {
            username,
          },
          {
            email,
          },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new Error('Username already taken.');
      }

      if (existingUser.email === email) {
        throw new Error('Email already taken.');
      }
    }

    const account = await AccountRepository.createOne({
      licenseNr,
      loanOfficersEmails,
      brokerAccountId,
      employeesNr,
    });

    const user = await UserRepository.createOne({
      username,
      email,
      accountId: account._id,
      isAccountOwner: true,
      role,
      ...omit(userParams, 'loanApplication'),
    });

    publish('User.didSignUp', {
      user,
      account,
    });

    return {
      user: pick(user, [
        'accountId',
        '_id',
        'title',
        'firstName',
        'lastName',
        'email',
        'username',
        'role',
        'address',
        'isActive',
        'createdAt',
        'updatedAt',
      ]),
      account: pick(account, [
        'isConfirmed',
        'isActive',
        '_id',
        'updatedAt',
        'createdAt',
      ]),
    };
  }
}
