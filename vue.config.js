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
        if (process.env.NODE_ENV === 'production') {
            // console.log();
            // console.log(" --- vue.config.js:configureWebpack ---"); 
            // console.log(config);
            // console.log(config.optimization);
            // console.log(config.plugins);
            config.performance = {};
            config.performance.maxAssetSize = 500000;
            config.performance.maxEntrypointSize = 500000;
        }
        
        config.plugins.push(new CopyWebpackPlugin([{
            from: 'example/public/',
            to: '.',
            ignore: ['index.html', '.DS_Store']
        }]));
        config.plugins.push(new CopyWebpackPlugin([{
            from: 'data/strokes.dat', /* from [projectdir]/data/strokes.dat */
            to: 'data/strokes.dat',   /* to    [outputDir]/data/strokes.dat */
            toType: 'file'
        }]));
    }
};