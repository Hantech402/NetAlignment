/* eslint-disable no-console */
import { ObjectID as objectId } from 'mongodb';
import Glue from 'glue';
import path from 'path';
import Hoek from 'hoek';
import Confidence from 'confidence';
import manifestConfig from '../../serverManifest.json';
import users from './users';

const store = new Confidence.Store(manifestConfig);

const manifest = store.get('/', {
  env: process.env.NODE_ENV || 'development',
});

const options = {
  relativeTo: path.join(__dirname, '../..', 'packages'),
};

Glue.compose(manifest, options, (err, server) => {
  Hoek.assert(!err, err);

  const { lookup, on } = server.eventDispatcher;

  const User = lookup('User');
  const AccountEntity = lookup('entity.Account');

  on('error', console.log.bind(console));

  Promise.all(
    users.map(async (userData) => {
      const { account } = await User.register(userData);

      await AccountEntity.confirm({
        _id: objectId(account._id),
      });
    }),
  ).then(() => {
    console.log('done!');
  }, console.log.bind(console));
});
