var webpack = require('webpack');

module.exports = {
  entry: {
    index: "./src/scripts/index.js",
    vendor: ["pikaday"],
  },
  output: {
    filename: '[name].js',
    path: require("path").resolve("./dist/scripts"),
  }
};