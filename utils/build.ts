// Do this as the first thing so that any code reading it knows the right env.
// utils/build.ts
// eslint-disable-next-line import/no-named-as-default
import webpack, { Configuration, Stats } from 'webpack';
import path from 'path';
import fs from 'fs';
import configImport from '../webpack.config';
import ZipPlugin from 'zip-webpack-plugin';
import packageInfo from '../package.json' assert { type: 'json' };

// Support both function and object exports from webpack.config
const config =
  typeof configImport === 'function' ? configImport() : configImport;

// Remove chromeExtensionBoilerplate if present
if ('chromeExtensionBoilerplate' in config) {
  delete (config as { chromeExtensionBoilerplate?: unknown })
    .chromeExtensionBoilerplate;
}

// Check for --dev flag
let isDev = true;
if (process.argv.includes('--production')) {
  isDev = false;
}
console.log(process.argv);
if (!isDev) {
  console.log('Building for production...');
  process.env.BABEL_ENV = 'production';
  process.env.NODE_ENV = 'production';
  process.env.ASSET_PATH = '/';
  config.mode = 'production';
  // Ensure infrastructureLogging.level is set to a valid value
  if (config.infrastructureLogging) {
    config.infrastructureLogging.level = 'info' as const;
  }
  config.plugins = (config.plugins || []).concat(
    new ZipPlugin({
      filename: `${packageInfo.name}-${packageInfo.version}.zip`,
      path: path.join(__dirname, '../', 'zip'),
    })
  );
} else {
  console.log('Building for development...');
  process.env.BABEL_ENV = 'development';
  process.env.NODE_ENV = 'development';
  config.mode = 'development';
  // Optionally adjust other dev-specific config here
}

webpack(config as Configuration, (err?: Error, stats?: Stats) => {
  if (err) throw err;
});
