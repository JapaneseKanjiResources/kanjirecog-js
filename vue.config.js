const CopyWebpackPlugin = require("copy-webpack-plugin");
const isProductionEnv = process.env.NODE_ENV === "production";

const srcPublicDir = "example/public/";

module.exports = {
    baseUrl: (isProductionEnv)
        ? "/kanjirecog"
        : "/",

    outputDir: "dist/example", /* [projectDir]/dist/example */
    pages: {
        index: {
            entry: "example/main.ts",
            template: srcPublicDir + "index.html",
            filename: "index.html",
        },
    },
    // tslint:disable-next-line:object-literal-sort-keys
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
            to: ".",
            ignore: ["index.html", ".DS_Store"],
        }]));
        config.plugins.push(new CopyWebpackPlugin([{
            from: "data/strokes.dat", /* from [projectDir]/data/strokes.dat */
            to: "data/strokes.dat",   /* to    [outputDir]/data/strokes.dat */
            toType: "file",
        }]));
    },
};
