import React, { PropTypes } from 'react';

const Layout = ({
  children,
}) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
    </head>
    <body>
      <div dangerouslySetInnerHTML={{ __html: children }} />
    </body>
  </html>
);

Layout.propTypes = {
  children: PropTypes.node,
};

export default Layout;
