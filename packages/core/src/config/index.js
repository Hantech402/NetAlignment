import path from 'path';
import Config from 'makeen-config';
import MemoryStore from 'makeen-config/build/stores/Memory';
import ENVStore from 'makeen-config/build/stores/Env';
import AliasStore from 'makeen-config/build/stores/Alias';
// import randomstring from 'randomstring';
import StdoutStore from 'makeen-octobus/build/libs/EventStore/Stdout';
import NullStore from 'makeen-octobus/build/libs/EventStore/Null';

const config = new Config();

config.addStore(
  new MemoryStore({
    rootDir: path.resolve(__dirname, '../../'),
    rootURL: 'http://localhost:3000',
    isDev: process.env.NODE_ENV === 'development',
    port: 3000,
    sentry: {
      dsn: '',
    },
    secrets: {
      jwt: 'JWT secret',
    },
    paths: {
      web: '',
    },
    session: {
      secret: '',
      name: 'sessionId',
      resave: false,
      saveUninitialized: false,
    },
    morgan: {
      format: 'dev',
    },
    maxUploadSize: '20mb',
    nodemailerConfig: {
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: '07a92525f92455',
        pass: '959fd2517f9ea8',
      },
    },
    modules: {
      mongodb: {
        connections: [
          {
            name: 'default',
            url: 'mongodb://localhost:27017/net-aligment',
          },
        ],
      },
      user: {
        jwtConfig: {
          expiresIn: '1d',
        },
        mockUserMiddlewarePivot: {
          before: 'isMethod',
        },
        passportMiddlewarePivot: 'cookieParser',
        mockUserConfig: {
          enabled: true,
          path: '/graphiql',
          params: {
            email: '',
          },
        },
        passportConfig: {
          enabled: false,
        },
      },
      mailer: {
        transport: {
          jsonTransport: true,
        },

        saveToDisk: false,
        emailsDir: '',
        templatesDir: '',
        middlewarePivot: {
          before: 'isMethod',
        },
      },
      fileStorage: {
        uploadDir: '',
      },
      gql: {
        graphiql: {
          enabled: true,
        },
      },
      router: {
        middlewarePivot: {
          after: 'isMethod',
        },
      },
      logger: {
        logsDir: '',
      },
      octobus: {
        messageStore: null,
      },
    },
  }),
);

config.addStore(new ENVStore('MAKEEN_CONFIG'));

config.addStore(
  new AliasStore(config, {
    'modules.user.jwtSecret': 'secrets.jwt',
    'modules.user.rootURL': 'rootURL',
    'modules.logger.logsDir': async c =>
    path.resolve(await c.get('rootDir'), './logs'),
    'paths.web': async c => path.resolve(await c.get('rootDir'), './web'),
    'modules.mailer.emailsDir': async c =>
    path.resolve(await c.get('rootDir'), './emails'),
    'modules.mailer.templatesDir': async c =>
    path.resolve(await c.get('rootDir'), './build/modules/mailer/templates'),
    'modules.fileStorage.uploadDir': async c =>
    path.resolve(await c.get('rootDir'), './uploads'),
    'modules.octobus.messageStore': async c => {
      const isDev = await c.get('isDev');
      return isDev ? new StdoutStore() : new NullStore();
    },
  }),
);

export default config;
