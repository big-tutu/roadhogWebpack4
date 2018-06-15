/**
 * Created by wjt12933 on 2018/5/9.
 */
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HappyPack = require('happypack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const os = require('os');
// 构造出共享进程池
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

const theme = require('./src/theme');

// console.log('主题变量\r\n', theme);

module.exports = {
  entry: path.resolve(__dirname, 'src', 'index.js'),
  output: {
    filename: '[name].[chunkhash:8].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/midway/',
    chunkFilename: '[name].[chunkhash:8].async.js',
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
        // 把对 .js 文件的处理转交给 id 为 babel 的 HappyPack 实例
        use: ['happypack/loader?id=babel'],
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
            // sourceMap: true,
            importLoaders: 1,
            modules: true,
            localIdentName: '[name]_[local]-[hash:base64:5]',
          },
        },
        {
          loader: 'less-loader',
          options: {
            // sourceMap: true,
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
            // sourceMap: true,
            importLoaders: 1,
          },
        },
        {
          loader: 'less-loader',
          options: {
            // sourceMap: true,
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
  stats: {
    children: false,
  },
  externals: {
    jquery: 'jQuery',
  },
  node: {
    fs: 'empty',
    module: 'empty',
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.(css|less)/,
          chunks: 'all',
          enforce: true,
        },
        commons: {
          name: 'commons',
          chunks: 'initial',
          minChunks: 2,
        },
        vendors: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
        },
      },
    },
    runtimeChunk: true,
  },
  plugins: [
    /*
    new UglifyJsPlugin({
      parallel: os.cpus().length,
    }),
    */
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
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano'),
      cssProcessorOptions: { discardComments: { removeAll: true } },
      canPrint: true,
    }),
    new HappyPack({
      id: 'babel',
      // 如何处理 .js 文件，用法和 Loader 配置中一样
      loaders: ['babel-loader?cacheDirectory'],
      // 使用共享进程池中的子进程去处理任务
      threadPool: happyThreadPool,
    }),
    new webpack.HashedModuleIdsPlugin(),
  ],
};
