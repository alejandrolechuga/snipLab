// Do this as the first thing so that any code reading it knows the right env.
import WebpackDevServer from 'webpack-dev-server';
import webpack from 'webpack';
import config from '../webpack.config';
import env from './env';
import path from 'path';
import fs from 'fs';

process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';
process.env.ASSET_PATH = '/';
// Define the type for chromeExtensionBoilerplate
interface ChromeExtensionBoilerplateOptions {
  notHotReload?: string[];
}

const options: ChromeExtensionBoilerplateOptions =
  config.chromeExtensionBoilerplate || {};
const excludeEntriesToHotReload = options.notHotReload || [];

for (const entryName in config.entry) {
  if (excludeEntriesToHotReload.indexOf(entryName) === -1) {
    config.entry[entryName] = [
      'webpack/hot/dev-server',
      `webpack-dev-server/client?hot=true&hostname=localhost&port=${env.PORT}`,
    ].concat(config.entry[entryName]);
  }
}

delete config.chromeExtensionBoilerplate;

const compiler = webpack(config);

const server = new WebpackDevServer(
  {
    https: {
      key: fs.readFileSync(path.join(__dirname, 'certs/localhost+2-key.pem')),
      cert: fs.readFileSync(path.join(__dirname, 'certs/localhost+2.pem')),
    },
    hot: true,
    liveReload: false,
    client: {
      webSocketTransport: 'sockjs',
      webSocketURL: {
        protocol: 'wss',
        hostname: 'localhost',
        port: env.PORT,
      },
    },
    webSocketServer: 'sockjs',
    host: 'localhost',
    port: env.PORT,
    static: {
      directory: path.join(__dirname, '../build'),
    },
    devMiddleware: {
      publicPath: `http://localhost:${env.PORT}/`,
      writeToDisk: true,
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    allowedHosts: 'all',
  },
  compiler
);

(async () => {
  await server.start();
})();
