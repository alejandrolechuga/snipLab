import webpack from 'webpack';
import path from 'path';
import fsExtra from 'fs-extra'; // Changed from fileSystem for clarity and convention
// Assuming utils/env.js is now utils/env.ts and has a default export
// e.g., export default { NODE_ENV: process.env.NODE_ENV || 'development' };
import env from './utils/env';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ReactRefreshTypeScript from 'react-refresh-typescript';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

// Define an interface for your custom Webpack configuration properties
interface MyWebpackConfiguration extends webpack.Configuration {
  chromeExtensionBoilerplate?: {
    notHotReload: string[];
  };
}

const ASSET_PATH: string = process.env.ASSET_PATH || '/';

const alias: Record<string, string> = {};

// load the secrets
const secretsPath: string = path.join(
  __dirname,
  'secrets.' + env.NODE_ENV + '.js'
);

const fileExtensions: string[] = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'eot',
  'otf',
  'svg',
  'ttf',
  'woff',
  'woff2',
];

if (fsExtra.existsSync(secretsPath)) {
  alias['secrets'] = secretsPath;
}

let isDevelopment: boolean = process.env.NODE_ENV !== 'production';
if (process.argv.includes('--production')) {
  isDevelopment = false;
}
console.log(isDevelopment ? 'Development mode' : 'Production mode');
const options: MyWebpackConfiguration = {
  mode: isDevelopment ? 'development' : 'production',
  entry: {
    //newtab: path.join(__dirname, 'src', 'pages', 'Newtab', 'index.tsx'),
    //options: path.join(__dirname, 'src', 'pages', 'Options', 'index.tsx'),
    //popup: path.join(__dirname, 'src', 'pages', 'Popup', 'index.tsx'),
    background: path.join(__dirname, 'src', 'pages', 'Background', 'index.ts'),
    contentScript: path.join(__dirname, 'src', 'pages', 'Content', 'index.ts'),
    devtools: path.join(__dirname, 'src', 'pages', 'Devtools', 'index.ts'),
    panel: path.join(__dirname, 'src', 'pages', 'Panel', 'index.tsx'),
    window: path.join(__dirname, 'src', 'pages', 'Window', 'index.ts'),
  },
  chromeExtensionBoilerplate: {
    // Your custom property
    notHotReload: [
      'background',
      'contentScript',
      'devtools',
      'window',
      'panel',
      'background',
    ],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'build'),
    clean: true,
    publicPath: ASSET_PATH,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: [/\.test\.(js|jsx|ts|tsx)$/, /\.spec\.(js|jsx|ts|tsx)$/],
        use: [
          {
            loader: 'babel-loader',
            // Ensure you have @babel/preset-typescript if Babel is handling TS/TSX
            // and that babel-loader options are correctly configured in babel.config.js
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: new RegExp('\\.(' + fileExtensions.join('|') + ')$'),
        type: 'asset/resource',
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader', // Using require.resolve is fine too
            options: {
              getCustomTransformers: () => ({
                before: [isDevelopment && ReactRefreshTypeScript()].filter(
                  Boolean
                ) as webpack.CustomTransformerFactory[], // Added type assertion
              }),
              transpileOnly: isDevelopment,
            },
          },
        ],
      },
      {
        test: /\.(js|jsx)$/, // This rule might conflict or be redundant if babel-loader above handles JS/JSX too
        use: [
          'source-map-loader',
          {
            loader: 'babel-loader', // Using require.resolve is fine
            options: {
              plugins: [
                isDevelopment && 'react-refresh/babel', // Using require.resolve is fine
              ].filter(Boolean),
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    alias: alias,
    extensions: fileExtensions
      .map((extension) => '.' + extension)
      .concat(['.js', '.jsx', '.ts', '.tsx', '.css']), // .js, .jsx might be less needed if all source is TS
  },
  plugins: [
    isDevelopment && new ReactRefreshWebpackPlugin(),
    new CleanWebpackPlugin({ verbose: false }),
    new ForkTsCheckerWebpackPlugin(), // Good for type checking in a separate process
    new webpack.ProgressPlugin(),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          to: path.join(__dirname, 'build'),
          force: true,
          transform: function (content: Buffer, filePath: string): Buffer {
            // Typed parameters
            return Buffer.from(
              JSON.stringify({
                description: process.env.npm_package_description,
                version: process.env.npm_package_version,
                ...JSON.parse(content.toString()),
              })
            );
          },
        },
        {
          from: 'src/assets/img/icon-128.png',
          to: path.join(__dirname, 'build'),
          force: true,
        },
        {
          from: 'src/assets/img/icon-34.png',
          to: path.join(__dirname, 'build'),
          force: true,
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'pages', 'Devtools', 'index.html'),
      filename: 'devtools.html',
      chunks: ['devtools'],
      publicPath: '',
      cache: false,
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'pages', 'Panel', 'index.html'),
      filename: 'panel.html',
      chunks: ['panel'],
      publicPath: '',
      cache: false,
    }),
  ].filter(Boolean) as webpack.WebpackPluginInstance[], // Type assertion for filtered array
  infrastructureLogging: {
    level: 'info',
  },
};

if (isDevelopment) {
  // Ensure devtool is a valid Webpack 5 devtool value
  options.devtool = 'cheap-module-source-map';
} else {
  options.optimization = {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  };
}

export default options; // Use ES6 export default
