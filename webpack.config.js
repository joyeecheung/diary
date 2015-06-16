var webpack = require('webpack');

module.exports = {
  entry: {
    index: "./src/js/index.js",
    vendor: ["pikaday"],
  },
  output: {
    filename: '[name].js',
    path: require("path").resolve("./dist/js"),
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin(
      /* chunkName= */"vendor",
      /* filename= */"vendor.bundle.js"),
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //       warnings: false
    //   }
    // }),
    new webpack.SourceMapDevToolPlugin(
      "[file].map", null,
      "[absolute-resource-path]", "[absolute-resource-path]"
    ),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ]
};