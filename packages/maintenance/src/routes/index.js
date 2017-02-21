import BPromise from 'bluebird';
import Boom from 'boom';

export default [{
  path: '/create-upload-dirs',
  method: 'POST',
  async handler(req, reply) {
    const { AccountEntity } = this;
    try {
      const accounts = await AccountEntity.findMany({
        fields: ['_id'],
      }).then((c) => c.toArray());

      await BPromise.map(
        accounts,
        (account) => AccountEntity.createUploadDir(account),
        { concurrency: 10 },
      );

      reply({
        ok: true,
      });
    } catch (err) {
      reply(Boom.wrap(err));
    }
  },
  config: {
    auth: {
      strategy: 'jwt',
      scope: 'admin',
    },
    description: 'Create upload directories for accounts that don\'t have them',
    tags: ['api'],
  },
}];
