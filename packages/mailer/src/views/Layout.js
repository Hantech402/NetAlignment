import React, { PropTypes } from 'react';

const Layout = ({
  children, transportConfig,
}) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
    </head>
    <body>
      <div>
        {children}
      </div>
    </body>
  </html>
);

Layout.propTypes = {
  children: PropTypes.node,
  transportConfig: PropTypes.object,
};

export default Layout;
