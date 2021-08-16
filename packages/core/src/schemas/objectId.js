import Joi from 'joi';

export default Joi.string().regex(
  /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i,
  { name: 'objectId' },
);
