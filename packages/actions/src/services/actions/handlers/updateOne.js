import { decorators, applyDecorators } from 'octobus.js';
import Joi from 'joi';
import pick from 'lodash/pick';

const { withHandler, withSchema, withLookups } = decorators;

const schema = Joi.object().keys({
  _id: Joi.object().required(),
  userId: Joi.object().required(),
  status: Joi.string().required(),
}).unknown().required();

const handler = async ({ params, next, dispatch, ActionEntity }) => {
  const { _id, userId, status } = params;
  const action = await ActionEntity.findById(_id);

  const updateResult = next({
    query: {
      _id,
    },
    update: {
      $set: {
        userId,
        status,
        timestamp: new Date(),
      },
      $push: {
        history: pick(action, ['userId', 'status', 'timestamp']),
      },
    },
  });

  if (status !== 'approved') {
    return updateResult;
  }

  return dispatch(`Action.${action.name}.execute`, action.payload);
};

export default applyDecorators([
  withSchema(schema),
  withLookups({
    ActionEntity: 'entity.Action',
  }),
  withHandler,
], handler);
