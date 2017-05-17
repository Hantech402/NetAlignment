/* eslint-disable class-methods-use-this */
import archiver from 'archiver';
import { ObjectID as objectId } from 'mongodb';
import { route, Router } from 'makeen-router';
import fs from 'fs';
import path from 'path';
import Boom from 'boom';

class StorageRouter extends Router {
  constructor(FileRepository, config = {}) {
    super({
      namespace: 'File',
      basePath: '/files',
      ...config,
    });

    this.FileRepository = FileRepository;
  }

  @route.get({
    path: '/',
    config: {
      auth: 'jwt',
      description: 'Get all the files of an account',
      tags: ['api'],
    },
  })
  async listFiles(request) {
    const { FileRepository } = this;
    const accountId = objectId(request.auth.credentials.accountId);
    const userId = objectId(request.auth.credentials.id);

    return FileRepository.findMany({
      query: {
        accountId,
        userId,
      },
    }).then(c => c.toArray());
  }

  @route.get({
    path: '/archive',
    config: {
      auth: 'bewit',
      description: 'Download an archive with all the files of an account',
    },
  })
  async archive(request, reply) {
    // eslint-disable-line
    const { FileRepository } = this;
    const accountId = objectId(request.auth.credentials.accountId);
    const userId = objectId(request.auth.credentials.id);

    try {
      const files = await FileRepository.findMany({
        query: {
          accountId,
          userId,
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

export default StorageRouter;
