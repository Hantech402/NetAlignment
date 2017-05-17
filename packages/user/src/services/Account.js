/* eslint-disable class-methods-use-this */

import Joi from 'joi';
import Boom from 'boom';
import { decorators } from 'octobus.js';
import ServiceContainer from 'makeen-core/build/octobus/ServiceContainer';

const { service, withSchema } = decorators;

class Account extends ServiceContainer {
  setServiceBus(...args) {
    super.setServiceBus(...args);

    this.AccountRepository = this.extract('AccountRepository');
    this.FileRepository = this.extract('FileRepository');
    this.LoanApplication = this.extract('LoanApplication');
  }

  @service()
  @withSchema(
    Joi.object()
      .keys({
        _id: Joi.object().required(),
        reason: Joi.string().required(),
      })
      .required(),
  )
  async deactivate(_id, reason) {
    const accountId = _id;
    const { AccountRepository, FileRepository, LoanApplication } = this;

    const activeLoanApplicationsNr = await LoanApplication.count({
      query: {
        accountId,
        status: 'open',
      },
    });

    if (activeLoanApplicationsNr) {
      throw Boom.badRequest(
        "You can't deactivate an account with active loan applications!",
      );
    }

    const result = await AccountRepository.updateOne({
      query: {
        _id,
      },
      update: {
        $set: {
          isDeactivated: true,
          deactivationReason: reason,
        },
      },
    });

    await Promise.all([
      LoanApplication.deleteMany({
        query: { accountId },
      }),
      FileRepository.deleteMany({
        query: { accountId },
      }),
    ]);

    return result;
  }
}

export default Account;
