/**
 * Created by wjt12933 on 2018/5/7.
 */
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const mockUrlObj = require('./devServer.mock');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

const theme = require('./src/theme');
const bodyParser = require('body-parser');

// console.log('主题变量\r\n', theme);

module.exports = {
  entry: path.resolve(__dirname, 'src', 'index.js'),
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    host: '0.0.0.0', // 主机地址
    port: 8008, // 端口号
    open: false,
    openPage: 'midway/',
    hot: true,
    overlay: {
      errors: true,
    },
    stats: {
      children: false,
      chunks: false,
      assets: false,
      modules: false,
    },
    before(app) {
      // 返回模拟请求数据
      Object.keys(mockUrlObj).forEach((key) => {
        const [type, url] = key.split(' ');
        app.use(url, bodyParser.json());
        if (type === 'GET') {
          app.get(url, mockUrlObj[key]);
        } else if (type === 'POST') {
          app.post(url, mockUrlObj[key]);
        }
      });
    },
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/midway/',
    chunkFilename: '[name].async.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'src'),
        ],
        exclude: [
          path.resolve(__dirname, 'src', 'components', 'Go'),
          path.resolve(__dirname, 'src', 'components', 'ZTree', 'js'),
          path.resolve(__dirname, 'src', 'components', 'Datatables', 'datatables.min.js'),
        ],
        loader: 'babel-loader?cacheDirectory',
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          }],
      },
      {
        test: /\.less$/,
        use: [MiniCssExtractPlugin.loader, {
          loader: 'css-loader',
          options: {
            sourceMap: true,
            importLoaders: 1,
            modules: true,
            localIdentName: '[name]_[local]-[hash:base64:5]',
          },
        },
        {
          loader: 'less-loader',
          options: {
            sourceMap: true,
            javascriptEnabled: true,
            modifyVars: theme,
          },
        }],
        exclude: /node_modules/,
      },
      {
        test: /\.less$/,
        use: [MiniCssExtractPlugin.loader, {
          loader: 'css-loader',
          options: {
            sourceMap: true,
            importLoaders: 1,
          },
        },
        {
          loader: 'less-loader',
          options: {
            sourceMap: true,
            javascriptEnabled: true,
            modifyVars: theme,
          },
        }],
        exclude: /src/,
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8192,
          },
        }],
      },
    ],
  },
  externals: {
    jquery: 'jQuery',
  },
  node: {
    fs: 'empty',
    module: 'empty',
  },
  devtool: 'source-map',
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.(css|less)/,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'index.html'), // 模板
      filename: 'index.html',
      hash: true, // 防止缓存
    }),
    new CleanWebpackPlugin(['dist']),
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, 'public'),
    }]),
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('./manifest.json'),
    }),
    new webpack.HotModuleReplacementPlugin(), // 调用webpack的热更新插件
    // new BundleAnalyzerPlugin(),
    // new HardSourceWebpackPlugin(),
  ],
};
