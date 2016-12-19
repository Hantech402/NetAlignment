import * as handlers from './handlers';

export default ({
  dispatcher, renderTemplate, transporter, app,
}) => {
  const { subscribe, onAfter } = dispatcher;

  subscribe('Mail.send', handlers.send({ renderTemplate, transporter }));

  onAfter('User.register', handlers.onAfterRegistration(app));

  subscribe('Mail.sendActivationEmail', handlers.sendActivationEmail(app));

  onAfter('User.resetPassword', handlers.sendPasswordResetEmail(app));
};
