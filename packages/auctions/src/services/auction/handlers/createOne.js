const handler = ({ params, next }) => { // eslint-disable-line
  if (!params.expiresAt) {
    // set expiresAt to 30 days from now
  }

  next(params);
};
