import findByIdRoute from './routes/findById';
import findManyRoute from './routes/findMany';
import findOneRoute from './routes/findOne';
import createOneRoute from './routes/createOne';
import replaceOneRoute from './routes/replaceOne';
import updateOneRoute from './routes/updateOne';
import deleteOneRoute from './routes/deleteOne';
import countRoute from './routes/count';

export default (serviceNamespace, schema, pathPrefix, config = {}) => {
  const findById = findByIdRoute(serviceNamespace, `${pathPrefix}/{id}`, config);
  const findMany = findManyRoute(serviceNamespace, pathPrefix, config);
  const findOne = findOneRoute(serviceNamespace, `${pathPrefix}/findOne`, config);
  const createOne = createOneRoute(serviceNamespace, pathPrefix, schema, config);
  const replaceOne = replaceOneRoute(serviceNamespace, `${pathPrefix}/{id}`, schema, config);
  const updateOne = updateOneRoute(serviceNamespace, `${pathPrefix}/{id}`, config);
  const deleteOne = deleteOneRoute(serviceNamespace, `${pathPrefix}/deleteOne`, config);
  const count = countRoute(serviceNamespace, `${pathPrefix}/count`, config);

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
