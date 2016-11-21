export default async function handler(request, reply) {
  const { User } = this;

  if (!request.auth.isAuthenticated) {
    return reply({
      error: request.auth.error,
    });
  }

  const credentials = request.auth.credentials;

  try {
    const result = await User.socialLogin(credentials);
    const user = await User.dump(result);
    return reply(user);
  } catch (err) {
    return reply(err);
  }
}
