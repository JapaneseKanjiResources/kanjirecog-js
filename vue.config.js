const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    baseUrl: process.env.NODE_ENV === 'production'
        ? '/kanjirecog'
        : '/',
        
    outputDir: 'example/dist',
    pages: {
        index: {
            entry: 'example/main.ts',
            template: 'example/public/index.html',
            filename: 'index.html',
        },
    },
    configureWebpack: config => {
        config.plugins.push(new CopyWebpackPlugin([{
            from: 'example/public/',
            to: '.',
            ignore: ['index.html', '.DS_Store']
        }]));
    }
};