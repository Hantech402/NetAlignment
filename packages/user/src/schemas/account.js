import Joi from 'joi';

export default {
  _id: Joi.object(),
  ownerId: Joi.object(),
  brokerAccountId: Joi.object().allow(null),

  isConfirmed: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
  licenseNr: Joi.string().allow(null),
  loanOfficersEmails: Joi.array().items(Joi.string().required().email()).allow(null),
  employeesNr: Joi.number().allow(null),

  isDeleted: Joi.boolean().default(false),
  isDeactivated: Joi.boolean().default(false),
  deactivationReason: Joi.string(),
  isApproved: Joi.boolean().default(true),
  deletedAt: Joi.date(),

  createdAt: Joi.date(),
  updatedAt: Joi.date(),
};
