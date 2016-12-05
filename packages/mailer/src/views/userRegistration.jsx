import React, { PropTypes } from 'react';

const Hello = ({ user, account, app }) => (
  <div>
    <h1>Hello!</h1>
    <p>Your account with username {user.username} was created.</p>
    <p>
      Click {' '}
      <a href={`${app.client}/account/${account._id.toString()}/confirm`}>here</a>
      {' '} to confirm your account.
    </p>
    <p>ktxbye!</p>
  </div>
);

Hello.propTypes = {
  user: PropTypes.object,
  account: PropTypes.object,
  app: PropTypes.object,
};

export default Hello;
