/* eslint-disable no-console */
import Glue from 'glue';
import path from 'path';
import Hoek from 'hoek';
import Confidence from 'confidence';
import manifestConfig from '../serverManifest.json';

const store = new Confidence.Store(manifestConfig);

const manifest = store.get('/', {
  env: process.env.NODE_ENV || 'development',
});

const options = {
  relativeTo: path.join(__dirname, '..', 'packages'),
};

Glue.compose(manifest, options, (err, server) => {
  Hoek.assert(!err, err);

  const { dispatch, on } = server.eventDispatcher;

  on('error', console.log.bind(console));

  dispatch('entity.Account.createOne', {
    isConfirmed: true,
    isActive: true,
  }).then((account) => (
    dispatch('entity.User.createOne', {
      accountId: account._id,
      username: 'viczam',
      firstName: 'Victor',
      lastName: 'Zamfir',
      email: 'victor@wirestorm.us',
      password: 'admin',
      isAccountOwner: true,
      isActive: true,
    })
  )).then(() => {
    console.log('done!');
  }, console.log.bind(console));
});
