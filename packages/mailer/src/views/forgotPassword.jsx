import React, { PropTypes } from 'react';

const Hello = ({ user }) => (
  <div>
    <h1>Hello!</h1>
    <p>Your forgot you password.</p>
    <p>
      Click {' '}
      <a href={`http://localhost:3004/user/recover-password/${user.resetPassword.token}`}>here</a>
      {' '} to recover your password.
    </p>
    <p>ktxbye!</p>
  </div>
);

Hello.propTypes = {
  user: PropTypes.shape({
    resetPassword: PropTypes.shape({
      token: PropTypes.string.isRequired,
    }),
  }),
};

export default Hello;
