import * as handlers from './handlers';

export default ({
  dispatcher, renderTemplate, transporter,
}) => {
  const { subscribe, onAfter } = dispatcher;

  subscribe('Mail.send', handlers.send({ renderTemplate, transporter }));

  onAfter('User.register', handlers.sendRegistrationEmail);

  onAfter('User.resetPassword', handlers.sendPasswordResetEmail);
};
