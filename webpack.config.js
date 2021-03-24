const { resolve } = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptionCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = {
  target: 'web',
  mode: 'production',
  entry: './src/js/index.js',
  output: {
    filename: 'js/[name].[contenthash:10].js',
    path: resolve(__dirname, 'build')
  },
  module: {
    rules: [
      {
        // 只对 index.js 做语法检查
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        enforce: 'pre',
        options: {
          fix: true
        }
      },
      {
        oneOf: [
          {
            test: /\.css$/,
            use: [
              {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  publicPath: '../'
                }
              },
              'css-loader',
              {
                loader: 'postcss-loader',
                options: {
                  postcssOptions: {
                    ident: 'postcss',
                    plugins: ['postcss-preset-env']
                  }
                }
              }
            ]
          },
          {
            test: /\.(jpeg|jpg|png|webp|svg|gif|apng)$/,
            loader: 'url-loader',
            options: {
              limit: 8 * 1024,
              name: '[contenthash:10].[ext]',
              outputPath: 'assets/img'
            }
          },
          {
            test: /\.html$/,
            loader: 'html-loader',
            options: {
              esModule: false
            }
          },
          {
            test: /\.(mp3|wav|ogg)$/,
            loader: 'file-loader',
            options: {
              name: '[contenthash:10].[ext]',
              outputPath: 'assets/music'
            }
          },
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'thread-loader',
                options: {
                  workers: 2
                }
              },
              {
                loader: 'babel-loader',
                options: {
                  presets: [
                    [
                      '@babel/preset-env',
                      {
                        useBuiltIns: 'usage',
                        corejs: {
                          version: 3
                        },
                        targets: {
                          chrome: '60',
                          firefox: '50',
                          ie: '9',
                          safari: '10',
                          edge: '11'
                        }
                      }
                    ]
                  ],
                  cacheDirectory: true
                }
              }
            ]
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: true
      }
    }),
    new MiniCssExtractPlugin({
      filename: 'css/built.css'
    }),
    new CopyPlugin({
      patterns: [{ from: './src/assets', to: 'assets' }]
    }),
    new OptionCssAssetsWebpackPlugin()
  ],
  devServer: {
    contentBase: resolve(__dirname, 'build'),
    compress: true,
    port: 3000,
    open: true,
    hot: true
  },
  performance: {
    hints: 'warning',
    maxEntrypointSize: 500000000,
    maxAssetSize: 300000000,
    assetFilter: function (assetFilename) {
      return assetFilename.endsWith('.css') || assetFilename.endsWith('.js')
    }
  }
}
