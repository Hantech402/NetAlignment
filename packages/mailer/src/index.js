import HapiReactViews from 'hapi-react-views';
import Vision from 'vision';
import path from 'path';
import nodemailer from 'nodemailer';
import Joi from 'joi';
import pkg from '../package.json';
import setupServices from './services/index';
import pluginOptionsSchema from './schemas/pluginOptions';

export function register(server, options, next) {
  const pluginOptions = Joi.attempt(options, pluginOptionsSchema);
  const dispatcher = server.plugins['hapi-octobus'].eventDispatcher;
  const transporter = nodemailer.createTransport({
    ...pluginOptions,
    logger: server.settings.isDevelopment,
    debug: server.settings.isDevelopment,
  });

  server.register([
    Vision,
  ]).then(() => {
    server.views({
      engines: {
        jsx: HapiReactViews,
      },
      compileOptions: {
        layoutPath: path.join(__dirname, 'views'),
        layout: 'layout',
      },
      relativeTo: __dirname,
      path: 'views',
    });

    setupServices({
      dispatcher,
      renderTemplate(template, context, renderOptions) {
        return new Promise((resolve, reject) => {
          server.render(template, context, renderOptions, (renderErr, rendered) => {
            if (renderErr) {
              return reject(renderErr);
            }

            return resolve(rendered);
          });
        });
      },
      transporter,
      app: server.settings.app,
    });

    next();
  }, next);
}

register.attributes = {
  pkg,
  dependencies: ['hapi-octobus'],
};
