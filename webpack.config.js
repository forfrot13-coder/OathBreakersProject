const path = require('path');

module.exports = {
  entry: {
    app: './game/static/game/js/index.tsx',
    vendor: ['react', 'react-dom'],
  },
  output: {
    path: path.resolve(__dirname, 'game/static/game/dist'),
    filename: '[name].js',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'game/static/game/js'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(tsx|ts|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  externals: {
    // Don't bundle these - they're loaded via CDN
    'react': 'React',
    'react-dom': 'ReactDOM',
  },
};
