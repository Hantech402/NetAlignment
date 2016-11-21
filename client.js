import Confidence from 'confidence';
import manifestConfig from './clientManifest.json';
import createServer from './src/createServer';

const store = new Confidence.Store(manifestConfig);
createServer(store);
