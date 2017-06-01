/* eslint-disable class-methods-use-this */
import { MongoResourceRouter, route } from 'makeen-router';
import { ObjectID as objectId } from 'mongodb';
import omit from 'lodash/omit';
import Joi from 'joi';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import Boom from 'boom';

import schema from '../schemas/loanApplication';

class LoanApplicationRouter extends MongoResourceRouter {
  constructor(
    {
      LoanApplicationRepository,
      FileRepository,
    },
    config = {},
  ) {
    super(LoanApplicationRepository, {
      namespace: 'LoanApplication',
      basePath: '/loan-applications',
      scope: 'borrower',
      entitySchema: omit(schema, [
        '_id',
        'accountId',
        'createdAt',
        'updatedAt',
      ]),
      ...config,
    });

    this.applyContext({
      generateContext: request => ({
        accountId: objectId(request.auth.credentials.accountId),
      }),
    });

    this.LoanApplicationRepository = LoanApplicationRepository;
    this.FileRepository = FileRepository;
  }

  @route.get({
    path: '/files',
    config: {
      description: 'Retrieve loan application files',
      validate: {
        params: {
          applicationId: Joi.string().required(),
        },
      },
    },
  })
  async getFiles(request) {
    const { FileRepository, LoanApplicationRepository } = this;
    const loanQuery = {
      _id: objectId(request.params.applicationId),
      accountId: objectId(request.auth.credentials.accountId),
    };

    const loanApplication = await LoanApplicationRepository.findOne(loanQuery);

    return FileRepository.findMany({
      query: {
        _id: {
          $in: loanApplication.fileIds,
        },
      },
    }).then(c => c.toArray());
  }

  @route.get({
    path: '/archive',
    config: {
      validate: {
        params: {
          applicationId: Joi.string().required(),
        },
      },
      auth: 'bewit',
      description: 'Download an archive with all the files of an loan application',
    },
  })
  async archive(request, reply) {
    const { FileRepository, LoanApplicationRepository } = this;
    const loanQuery = {
      _id: objectId(request.params.applicationId),
      accountId: objectId(request.auth.credentials.accountId),
    };

    const loanApplication = await LoanApplicationRepository.findOne(loanQuery);

    try {
      const files = await FileRepository.findMany({
        query: {
          _id: {
            $in: loanApplication.fileIds,
          },
        },
      }).then(c => c.toArray());

      if (!files.length) {
        return reply(null);
      }

      const archive = archiver('zip', {
        store: true,
      });

      await Promise.all(
        files.map(async file => {
          const filePath = await FileRepository.getPath(file);
          archive.append(fs.createReadStream(path.resolve(filePath)), {
            name: file.filename,
          });
        }),
      );

      reply(archive).header(
        'Content-Disposition',
        'attachment; filename=archive.zip',
      );

      return archive.finalize();
    } catch (err) {
      return reply(Boom.wrap(err));
    }
  }
}

export default LoanApplicationRouter;
