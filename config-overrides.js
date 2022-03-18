/* eslint-disable no-undef */
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const {
    override,
    fixBabelImports,
    addLessLoader,
    addWebpackPlugin,
    disableEsLint,
    addWebpackAlias,
} = require('customize-cra');

module.exports = override((config) => {
    config.plugins.push(
        new CopyPlugin({
            // Use copy plugin to copy *.wasm to output folder.
            patterns: [{ from: 'node_modules/onnxruntime-web/dist/*.wasm', to: 'static/js/[name][ext]' }],
        })
    );
    return config;
});
