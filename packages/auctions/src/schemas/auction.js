/**
 * https://docs.google.com/spreadsheets/d/1sGz0jbU7ps-Z6UlFzhTEApHt-FbJsTXadYeQqAHtUjc/edit?ts=5851a4eb#gid=0
 */
import Joi from 'joi';
import {
  statuses, financialGoals, rates, termsByRate, types, purposes, propertyTypes,
  estateTypes,
} from '../constants';

export default {
  _id: Joi.object(),
  accountId: Joi.object().required(),
  documentIds: Joi.array().default([]),

  status: Joi.string().valid(statuses),
  financialGoal: Joi.string().valid(financialGoals).required(),
  rate: Joi.string().valid(rates).required(),
  termsByRate: Object.keys(termsByRate).reduce((validator, rateValue) => (
    validator.when('rate', {
      is: rateValue,
      then: Joi.string().required().valid(termsByRate[rateValue]),
    })
  ), Joi.alternatives()),
  type: Joi.string().valid(types),
  typeOther: Joi.string().when('type', {
    is: 'Other',
    then: Joi.required(),
  }),
  agencyCaseNumber: Joi.number(),
  lenderCaseNumber: Joi.number(),
  amount: Joi.number(),
  interestRate: Joi.number().min(1).max(100),
  nrOfMonths: Joi.number().integer().min(1),

  property: Joi.object().keys({
    address: Joi.object().keys({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      ZIP: Joi.string(),
    }),
    unitsNr: Joi.number(),
    legalDescription: Joi.string(),
    yearBuilt: Joi.number(),
    purpose: Joi.string().valid(purposes),
    purposeOther: Joi.string().when('purpose', {
      is: 'Other',
      then: Joi.required(),
    }),
    type: Joi.string().valid(propertyTypes),
    yearAcquired: Joi.number().when('purpose', {
      is: Joi.valid(['Construction', 'Refinance', 'Construction-Permanent']),
      then: Joi.required(),
    }),
    originalCost: Joi.number().when('purpose', {
      is: Joi.valid(['Construction', 'Refinance', 'Construction-Permanent']),
      then: Joi.required(),
    }),
    amountExistingLiens: Joi.number().when('purpose', {
      is: Joi.valid(['Construction', 'Refinance', 'Construction-Permanent']),
      then: Joi.required(),
    }),
    presentValueOfLot: Joi.number().when('purpose', {
      is: Joi.valid(['Construction', 'Construction-Permanent']),
      then: Joi.required(),
    }),
    purposeOfRefinance: Joi.number().when('purpose', {
      is: Joi.valid(['Refinance']),
      then: Joi.required(),
    }),
    costOfImprovements: Joi.number().when('purpose', {
      is: Joi.valid(['Construction', 'Refinance', 'Construction-Permanent']),
      then: Joi.required(),
    }),
    improvementsType: Joi.string().valid(['made', 'toBeMade']),
    title: Joi.object().keys({
      names: Joi.array().items(Joi.string()),
      manner: Joi.string(),
    }),
    estateHeldIn: Joi.string().valid(estateTypes),
    leaseholdExpiration: Joi.date().when('estateHeldIn', {
      is: 'Leasehold',
      then: Joi.required(),
    }),
    paymentSource: Joi.string(),
  }),

  isDeleted: Joi.boolean().default(false),
  deletedAt: Joi.date(),
  expiresAt: Joi.date(),

  createdAt: Joi.date(),
  updatedAt: Joi.date(),
};
