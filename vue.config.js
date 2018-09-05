const CopyWebpackPlugin = require('copy-webpack-plugin');
const isProductionEnv = process.env.NODE_ENV === 'production';

const srcPublicDir = 'example/public/';

module.exports = {
    baseUrl: (isProductionEnv)
        ? '/kanjirecog'
        : '/',
    
    outputDir: 'example/dist',
    pages: {
        index: {
            entry: 'example/main.ts',
            template: srcPublicDir + 'index.html',
            filename: 'index.html',
        },
    },
    configureWebpack: config => {
        if (isProductionEnv) {
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
            from: srcPublicDir,
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