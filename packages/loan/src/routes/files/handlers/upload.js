import Boom from 'boom';

export default async function (request, reply) {
  const { LoanApplicationEntity } = this;
  const { loanApplication } = request.pre;
  const uploadedFile = request.payload.file;

  try {
    const file = await LoanApplicationEntity.addFile({
      loanApplication,
      uploadedFile,
    });

    reply(file);
  } catch (err) {
    reply(Boom.wrap(err));
  }
}
