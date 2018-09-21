const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const outputDir = './wwwroot/dist';
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
module.exports = (env) => {
  const isDevBuild = !(env && env.prod);

  const config = {
    stats: { modules: false },
    resolve: { extensions: ['.js', '.jsx'] },
    mode: isDevBuild ? 'development' : 'production',
    output: {
      path: path.join(__dirname, outputDir),
      filename: '[name].js',
      publicPath: 'dist/'
    },
    module: {
      rules: [
        {
          exclude: /\.(html|js|jsx|s?css|json|jpe?g|png|gif|bmp)$/i,
          loader: require.resolve('file-loader'),
          options: {
            name: 'static/media/[name].[ext]'
          }
        },
        {
          test: /\.(jpe?g|png|gif|bmp)$/i,
          loader: require.resolve('url-loader'),
          options: {
            limit: 10000,
            name: 'static/media/[name].[ext]'
          }
        },
        {
          test: /\.(js|jsx)$/,
          include: resolveApp('js'),
          loader: require.resolve('babel-loader'),
          options: {
            cacheDirectory: true
          }
        },
        {
          test: /\.css$/,
          use:[
            MiniCssExtractPlugin.loader,
            'css-loader'
          ]
        }
      ]
    },
    entry: {
      site: './js/site.js',
      cookieContent: './js/cookieContent.js',
      sampleData: './js/index.jsx'
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "[name].css"
      })
    ].concat(isDevBuild ? [
      // Plugins that apply in development builds only
      new webpack.SourceMapDevToolPlugin({
        filename: '[file].map',
        moduleFilenameTemplate: path.relative(outputDir, '[resourcePath]')
      })
    ] : [
      // Plugins that apply in production builds only
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.optimize.OccurrenceOrderPlugin()
    ])
  };

  return [config];
};
