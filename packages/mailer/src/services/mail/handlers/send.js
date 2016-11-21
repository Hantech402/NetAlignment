const handler = ({ transporter, renderTemplate }) => async ({ params }) => {
  const { template, context, ...restParams } = params;
  const html = await renderTemplate(template, context);
  return new Promise((resolve, reject) => {
    transporter.sendMail({
      ...restParams,
      html,
    }, (err, info) => {
      if (err) {
        return reject(err);
      }

      return resolve(info);
    });
  });
};

export default handler;
