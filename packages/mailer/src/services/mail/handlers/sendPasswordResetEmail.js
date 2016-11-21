const handler = async ({ user }, { dispatch }) => {
  dispatch('Mail.send', {
    to: user.email,
    subject: 'forgot password',
    template: 'forgotPassword',
    context: {
      user,
    },
  });
};

export default handler;
