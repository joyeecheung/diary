var webpack = require('webpack');

module.exports = {
  sourcemap: new webpack.SourceMapDevToolPlugin(
      "[file].map", null,
      "[absolute-resource-path]", "[absolute-resource-path]"
    ),
  common: new webpack.optimize.CommonsChunkPlugin(
      /* chunkName= */"vendor",
      /* filename= */"vendor.bundle.js"),
  uglify: new webpack.optimize.UglifyJsPlugin({
      compress: {
          warnings: false
      }
    }),
  ignoreLocale: new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
};