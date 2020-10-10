const path = require("path");

module.exports = {
  entry: "./src/www/index.js",
  mode: "development",
  output: {
    filename: "./main.js",
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: true,
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ["file-loader"],
      }
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, "src/www"),
  },
  node: {
    console: true,
    fs: "empty",
    net: "empty",
    tls: "empty"
  }
};
