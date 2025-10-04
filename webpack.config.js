const path = require("path");

module.exports = {
  mode: "production",                 // or "development"
  entry: "./index.mjs",               // your root ES module
  output: {
    filename: "tcadif.js",            // single file output
    path: path.resolve(__dirname, "dist"),
    clean: true,
    library: {
        type: "global",
        name: "tcadif",
        export: 'default',
    }
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/
      }
    ]
  },
  optimization: {
    splitChunks: false,               // keep one bundle
    runtimeChunk: false               // inline runtime
  },
  devtool: false                      // optional: no source map in prod
};
