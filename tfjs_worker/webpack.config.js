const path = require('path');
const WorkerLoader = require("worker-plugin");

module.exports = {
    mode: 'development',
    entry: './src/ts/main.ts',
    output: {
        // filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/dist/'
    },
    devtool: 'inline-source-map',
    module: {
        rules: [{
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    plugins: [new WorkerLoader()]
}
