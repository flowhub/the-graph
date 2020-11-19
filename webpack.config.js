const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { Z_FULL_FLUSH } = require('zlib');

module.exports = {
  entry: {
    'the-graph': './index.js',
    'the-graph-render': './render.jsjob.js',
    'demo-full': './examples/demo-full.js',
    'demo-simple': './examples/demo-simple.js',
    'demo-thumbnail': './examples/demo-thumbnail.js',
  },
  output: {
    path: path.resolve(__dirname, './dist/'),
    filename: '[name].js',
    sourceMapFilename: '[name].js.map',
  },
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.styl$/,
        use: ['style-loader', 'css-loader', 'stylus-loader'],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'demo-full.html',
      template: 'examples/demo-full.html',
      chunks: ['demo-full'],
    }),
    new HtmlWebpackPlugin({
      filename: 'demo-simple.html',
      template: 'examples/demo-simple.html',
      chunks: ['demo-simple'],
    }),
    new HtmlWebpackPlugin({
      filename: 'demo-thumbnail.html',
      template: 'examples/demo-thumbnail.html',
      chunks: ['demo-thumbnail'],
    }),
  ],
  resolve: {
    fallback: {
      events: require.resolve('events/'),
      fs: false,
    },
  },
};
