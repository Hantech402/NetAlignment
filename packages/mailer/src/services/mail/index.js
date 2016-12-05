import * as handlers from './handlers';

export default ({
  dispatcher, renderTemplate, transporter, app,
}) => {
  const { subscribe, onAfter } = dispatcher;

  subscribe('Mail.send', handlers.send({ renderTemplate, transporter }));

  onAfter('User.register', handlers.sendRegistrationEmail(app));

  onAfter('User.resetPassword', handlers.sendPasswordResetEmail);
};
