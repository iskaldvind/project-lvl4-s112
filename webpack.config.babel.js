import path from 'path';
import webpack from 'webpack';
import autoprefixer from 'autoprefixer';

export default () => ({
  entry: {
    app: ['./client'],
    vendor: ['babel-polyfill', 'jquery', 'jquery-ujs'],
  },
  output: {
    path: path.join(__dirname, 'public', 'assets'),
    filename: 'application.js',
    publicPath: '/assets/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: 'style-loader!css-loader!postcss-loader',
      },
    ],
  },
  postcss() {
    return [autoprefixer];
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.js',
      minChunks: Infinity,
    }),
  ],
});
