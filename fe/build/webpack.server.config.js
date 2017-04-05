var fs = require('fs')
var path = require('path')
var webpack = require('webpack');
var SERVER_DIR = path.normalize(__dirname + '/../src') // server.js所在的目录
var ROOT_PATH = path.normalize(__dirname + '/../..') // 项目根目录，有利于查找node_modules
var RESOURCE_PATH = path.resolve(ROOT_PATH, 'resources/static/')


var nodeModules = fs.readdirSync(path.resolve(ROOT_PATH, 'node_modules'))
                    .concat([
                        'react-dom/server', 'react/addons',
                    ])
                    .reduce(function(ext, mod) {
                        ext[mod] = 'commonjs ' + mod
                        return ext
                    }, {});
module.exports = {

    entry: path.resolve(SERVER_DIR, 'server.js'),

    output: {
        path: SERVER_DIR,
        filename: 'server.bundle.js'
    },
    name: 'server',
    // 告诉webpack一些系统内建模块例如fs、path，不要编译进来，但是node_moudles第三发模块需要单独处理
    // 详见externals
    target: 'node',
    externals: nodeModules,
    node: {
        __filename: true,
        __dirname: true
    },
    module: {
        loaders: [{
                test: /\.(js|jsx)$/,
                loader: 'babel',
                exclude: /node_modules/,
            }, {
                test: /\.scss$/,
                exclude: path.resolve(RESOURCE_PATH, 'styles/'), // 公共样式之外的，都是用css-modules进行管理
                loaders: ['css/locals?modules&importLoaders=1&localIdentName=[name]__[local]-[hash:base64:5]', 'sass']
            },

            // 必要时，字体和图片的loader也要搬运过来，这里暂时不需要。
        ]
    },
    // 处理sourcemap用于快速定位错误
    plugins: [new webpack.BannerPlugin('require("source-map-support").install();',{ raw: true, entryOnly: false })],
    //devtool: 'sourcemap'
}
