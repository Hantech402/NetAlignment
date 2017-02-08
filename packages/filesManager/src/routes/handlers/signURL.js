import Hawk from 'hawk';

export default async function (request, reply) {
  const { url } = request.payload;
  const { bewitCredentials } = this;
  const id = request.auth.credentials.accountId;

  const bewit = Hawk.client.getBewit(url, {
    credentials: {
      ...bewitCredentials,
      id,
    },
    ttlSec: 600,
  });

  reply({
    url: `${url}?bewit=${bewit}`,
  });
}
