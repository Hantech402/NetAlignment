import Hawk from 'hawk';

export default async function (request, reply) {
  const { url } = request.payload;
  const { bewitCredentials } = this;
  const { id } = request.auth.credentials;

  const bewit = Hawk.client.getBewit(url, {
    credentials: {
      ...bewitCredentials,
      id,
    },
    ttlSec: 60,
  });

  reply(`${url}?bewit=${bewit}`);
}
