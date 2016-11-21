/* eslint-disable no-console */
import prettyFormat from 'pretty-format';

export default (dispatcher) => {
  const { subscribe } = dispatcher;

  subscribe('stringify', ({ params }) => {
    console.log(JSON.stringify(params, null, 2));
  });

  subscribe('prettyFormat', ({ params }) => {
    console.log(prettyFormat(params));
  });
};
