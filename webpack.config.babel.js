import path from 'path';

export default {
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  mode: 'production',
  entry: './src/client/client.js',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader'
      },
      {
        test: /\.node$/,
        loader: 'node-loader'
      }
    ]
  }
};
