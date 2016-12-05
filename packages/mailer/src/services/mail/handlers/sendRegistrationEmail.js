export default (app) => ({ result, dispatch }) => {
  if (result && result.user) {
    const { user, account } = result;
    dispatch('Mail.send', {
      to: user.email,
      subject: 'welcome',
      template: 'userRegistration',
      context: {
        user,
        account,
        app,
      },
    });
  }
};
