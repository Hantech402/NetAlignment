export default (app) => ({ result, dispatch }) => {
  const { user } = result;

  dispatch('Mail.send', {
    to: user.email,
    subject: 'forgot password',
    template: 'forgotPassword',
    context: {
      app,
      user,
    },
  });
};
