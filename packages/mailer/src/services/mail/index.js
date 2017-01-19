import * as handlers from './handlers';

export default ({
  dispatcher, renderTemplate, transporter, emailsDir, app,
}) => {
  const { subscribe, onAfter } = dispatcher;

  subscribe('Mail.send', handlers.send({ renderTemplate, transporter, emailsDir, app, emailsDir }));

  onAfter('User.register', handlers.onAfterRegistration);

  subscribe('Mail.sendActivationEmail', handlers.sendActivationEmail);

  onAfter('User.resetPassword', handlers.onAfterPasswordReset);
};
