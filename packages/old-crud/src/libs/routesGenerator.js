import findByIdRoute from './routes/findById';
import findManyRoute from './routes/findMany';
import findOneRoute from './routes/findOne';
import createOneRoute from './routes/createOne';
import replaceOneRoute from './routes/replaceOne';
import updateOneRoute from './routes/updateOne';
import deleteOneRoute from './routes/deleteOne';
import countRoute from './routes/count';

const defaultOptions = {
  isBoundToAccount: false,
};

export default ({
  serviceNamespace,
  schema,
  pathPrefix = '',
  config = {},
  options = {},
}) => {
  const finalOptions = { ...defaultOptions, ...options };
  const findById = findByIdRoute(serviceNamespace, `${pathPrefix}/{id}`, config, finalOptions);
  const findMany = findManyRoute(serviceNamespace, pathPrefix, config, finalOptions);
  const findOne = findOneRoute(serviceNamespace, `${pathPrefix}/findOne`, config, finalOptions);
  const createOne = createOneRoute(serviceNamespace, pathPrefix, schema, config, finalOptions);
  const replaceOne = replaceOneRoute(serviceNamespace, `${pathPrefix}/{id}`, schema, config, finalOptions);
  const updateOne = updateOneRoute(serviceNamespace, `${pathPrefix}/{id}`, config, finalOptions);
  const deleteOne = deleteOneRoute(serviceNamespace, `${pathPrefix}/deleteOne`, config, finalOptions);
  const count = countRoute(serviceNamespace, `${pathPrefix}/count`, config, finalOptions);

  return {
    findById,
    findMany,
    findOne,
    createOne,
    replaceOne,
    updateOne,
    count,
    deleteOne,
  };
};
