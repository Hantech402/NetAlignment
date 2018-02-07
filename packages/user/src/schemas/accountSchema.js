import Joi from 'joi';

export default {
  _id: Joi.object(),
  ownerId: Joi.object(),
  brokerAccountId: Joi.object().default(null),

  isConfirmed: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
  licenseNr: Joi.string().default(null),
  loanOfficersEmails: Joi.array().items(Joi.string().required().email()).default(null),
  employeesNr: Joi.number().default(null),

  isDeleted: Joi.boolean().default(false),
  isDeactivated: Joi.boolean().default(false),
  deactivationReason: Joi.string(),
  isApproved: Joi.boolean().default(true),
  deletedAt: Joi.date(),

  createdAt: Joi.date(),
  updatedAt: Joi.date(),
};
