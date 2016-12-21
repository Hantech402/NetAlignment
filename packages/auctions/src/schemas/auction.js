/**
 * https://docs.google.com/spreadsheets/d/1sGz0jbU7ps-Z6UlFzhTEApHt-FbJsTXadYeQqAHtUjc/edit?ts=5851a4eb#gid=0
 */
import Joi from 'joi';
import addressSchema from 'na-core/src/schemas/address';
import {
  statuses, financialGoals, rates, termsByRate, types, purposes, propertyTypes,
  estateTypes,
} from '../constants';
import borrowerProfileSchema from './borrowerProfile';
import employmentSchema from './employment';
import incomeSchema from './income';
import expenseSchema from './expense';

export default {
  _id: Joi.object(),
  accountId: Joi.object().required(),
  fileIds: Joi.array().default([]),

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
  amount: Joi.number().min(0),
  interestRate: Joi.number().min(1).max(100),
  nrOfMonths: Joi.number().integer().min(1),

  propertyInfo: Joi.object().keys({
    address: Joi.object().keys(addressSchema),
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
    purposeOfRefinance: Joi.string().when('purpose', {
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

  borrowerInfo: Joi.object().keys({
    borrower: borrowerProfileSchema,
    coBorrower: borrowerProfileSchema,
  }),

  employmentInfo: Joi.object().keys({
    borrower: Joi.array().items(Joi.object().keys(employmentSchema)),
    coBorrower: Joi.array().items(Joi.object().keys(employmentSchema)),
  }),

  monthlyIncomeAndCombinedHousingExpenseInformation: Joi.object().keys({
    grossMonthlyIncome: Joi.object().keys({
      borrower: Joi.object().keys(incomeSchema),
      coBorrower: Joi.object().keys(incomeSchema),
    }),
    combinedHousingExpense: Joi.object().keys(expenseSchema),
    otherIncome: Joi.array().items(Joi.object().keys({
      dontConsiderBy: Joi.string().valid(['borrower', 'coBorrower']),
      item: Joi.string(),
      monthlyAmount: Joi.number(),
    })),
  }),

  isDeleted: Joi.boolean().default(false),
  deletedAt: Joi.date(),
  expiresAt: Joi.date(),

  createdAt: Joi.date(),
  updatedAt: Joi.date(),
};
