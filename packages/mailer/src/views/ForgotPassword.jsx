import React, { PropTypes } from 'react';
import Layout from './Layout.jsx'; // eslint-disable-line

const ForgostPassword = ({ user, app, transportConfig }) => (
  <Layout transportConfig={transportConfig}>
    <h1>Hello!</h1>
    <p>Your forgot you password.</p>
    <p>
      Click {' '}
      <a href={`${app.client}/change-password/${user.resetPassword.token}`}>here</a>
      {' '} to recover your password.
    </p>
    <p>ktxbye!</p>
  </Layout>
);

ForgostPassword.propTypes = {
  user: PropTypes.shape({
    resetPassword: PropTypes.shape({
      token: PropTypes.string.isRequired,
    }),
  }),
  app: PropTypes.shape({
    client: PropTypes.string.isRequired,
  }),
  transportConfig: PropTypes.object,
};

export default ForgostPassword;
