import Joi from 'joi';
import {
  statuses, financialGoals, rates, termsByRate, types, purposes, propertyTypes, estateTypes,
} from '../constants';
import borrowerProfileSchema from './borrowerProfile';
import employmentSchema from './employment';
import incomeSchema from './income';
import expenseSchema from './expense';
import { addressSchema } from './address';

export default {
  _id: Joi.object(),
  accountId: Joi.object().required(),
  fileIds: Joi.array().default([]),

  borrower: Joi.string(),
  coBorrower: Joi.string(),

  invitedLenders: Joi.array().items(Joi.string().required()),
  acceptedLenderAccount: Joi.object(),

  status: Joi.string().valid(statuses).default('draft'),
  financialGoal: Joi.string().valid(financialGoals),
  rate: Joi.string().valid(rates),
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
    yearAcquired: Joi.number().allow(null),
    originalCost: Joi.number().allow(null),
    amountExistingLiens: Joi.number().allow(null),
    presentValueOfLot: Joi.number().allow(null),
    purposeOfRefinance: Joi.string().allow(null),
    costOfImprovements: Joi.number().allow(null),
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

  assetsAndLiabilities: Joi.object().keys({
    completedJointly: Joi.boolean(),
    assets: Joi.array().items(Joi.object().keys({
      accountNr: Joi.string(),
      bankInfo: Joi.string(),
      cashOrMarketValue: Joi.number(),
    })),
    liabilities: Joi.array().items(Joi.object().keys({
      nameAndAddressOfCompany: Joi.string(),
      accountNr: Joi.string(),
      monthlyPayment: Joi.number(),
      monthsLeftToPay: Joi.number(),
      unpaidBalance: Joi.number(),
    })),
    scheduleOfRealEstateOwned: Joi.array().items(Joi.object().keys({
      propertyAddress: Joi.string(),
      propertyType: Joi.string().valid(['sold', 'pending sale', 'rental being held for income']),
      presentMarketValue: Joi.number(),
      amountOfMortgagesAndLiens: Joi.number(),
      grossRentalIncome: Joi.number(),
      mortgagepayments: Joi.number(),
      insuranceMaintenanceOrTaxes: Joi.number(),
      netRentalIncome: Joi.number(),
    })),
  }),

  detailsOfTransaction: Joi.object().keys({
    a: Joi.number(),
    b: Joi.number(),
    c: Joi.number(),
    d: Joi.number(),
    e: Joi.number(),
    f: Joi.number(),
    g: Joi.number(),
    h: Joi.number(),
    i: Joi.number(),
    j: Joi.number(),
    k: Joi.number(),
    l: Joi.number(),
    m: Joi.number(),
    n: Joi.number(),
    o: Joi.number(),
    p: Joi.number(),
  }),

  declarations: Joi.object().keys({
    a: Joi.object().keys({
      borrower: Joi.boolean(),
      coBorrower: Joi.boolean(),
    }),
    b: Joi.object().keys({
      borrower: Joi.boolean(),
      coBorrower: Joi.boolean(),
    }),
    c: Joi.object().keys({
      borrower: Joi.boolean(),
      coBorrower: Joi.boolean(),
    }),
    d: Joi.object().keys({
      borrower: Joi.boolean(),
      coBorrower: Joi.boolean(),
    }),
    e: Joi.object().keys({
      borrower: Joi.boolean(),
      coBorrower: Joi.boolean(),
    }),
    f: Joi.object().keys({
      borrower: Joi.boolean(),
      coBorrower: Joi.boolean(),
    }),
    g: Joi.object().keys({
      borrower: Joi.boolean(),
      coBorrower: Joi.boolean(),
    }),
    h: Joi.object().keys({
      borrower: Joi.boolean(),
      coBorrower: Joi.boolean(),
    }),
    i: Joi.object().keys({
      borrower: Joi.boolean(),
      coBorrower: Joi.boolean(),
    }),
    j: Joi.object().keys({
      borrower: Joi.boolean(),
      coBorrower: Joi.boolean(),
    }),
    k: Joi.object().keys({
      borrower: Joi.boolean(),
      coBorrower: Joi.boolean(),
    }),
    l: Joi.object().keys({
      borrower: Joi.boolean(),
      coBorrower: Joi.boolean(),
    }),
    m: Joi.object().keys({
      borrower: Joi.boolean(),
      coBorrower: Joi.boolean(),
    }),
  }),

  isDeleted: Joi.boolean().default(false),
  deletedAt: Joi.date(),
  expiresAt: Joi.date(),

  createdAt: Joi.date(),
  updatedAt: Joi.date(),
};
