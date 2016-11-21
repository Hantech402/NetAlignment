const handler = ({ user, account }, { dispatch }) => {
  dispatch('Mail.send', {
    to: user.email,
    subject: 'welcome',
    template: 'userRegistration',
    context: {
      user,
      account,
    },
  });
};

export default handler;
