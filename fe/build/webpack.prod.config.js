var path = require('path') ;
var HtmlwebpackPlugin = require('html-webpack-plugin') ;
var webpack = require('webpack') ;
var autoprefixer = require('autoprefixer');

var ROOT_PATH = path.normalize(__dirname+'/../..') ;
var APP_PATH = path.resolve(ROOT_PATH,'fe/src/') ;
var BUILD_PATH = path.resolve(ROOT_PATH,'resources/static/dist') ;
var RESOURCE_PATH = path.resolve(ROOT_PATH,'resources/static/')

var ExtractTextPlugin = require("extract-text-webpack-plugin"); // 分离css文件
var commonStyleExtract = new ExtractTextPlugin("common.css"); //{ allChunks: true}默认选项,全局css打包插件配置
var moduleStyleExtract = new ExtractTextPlugin('module.css') ;// 模块css打包插件配置
// ExtractTextPlugin.extract(loaders)只有一个要打包的就直接使用这个函数包裹loader，否则就像上面那样配置。

module.exports = {
	name:'client',
	target:'web',
	entry:[
		path.resolve(APP_PATH,'client.js'),
		'webpack-hot-middleware/client'],
	output:{
		path:BUILD_PATH,
		filename:'bundle.js', // 这里加入[hash]表示使用hash来防止js文件缓存
		publicPath:'/static/dist' //配合服务器设置静态资源路径
	},
	plugins:[
		new webpack.optimize.UglifyJsPlugin({minimize:true}),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.optimize.CommonsChunkPlugin(/*chunkname*/"vendor",/*filename*/"vendor.js"),
		commonStyleExtract,
		moduleStyleExtract
	],
	devtool:'eval-source-map',
	resovle:{
		extensions:['','.js','.jsx'] //必须先写''否则会找index.js.js和index.js.jsx
	},
	externals: {'mqtt':'mqtt'}
	,
	postcss: function () {
	    return [require('autoprefixer'), require('precss')]; 
	}
	  // postcss: [ autoprefixer({ browsers: ['last 2 versions'] }) ]
	,
	module:{
		noParse: [],
		loaders:[
			{
				test:/\.scss$/,
				loader:commonStyleExtract.extract('style',['css?sourceMap&-minimize','postcss','sass?sourceMap']), 
				include:path.resolve(RESOURCE_PATH,'styles/') // 表示这里放了公共的全局的样式
			},{
				test:/\.scss$/,
				exclude:path.resolve(RESOURCE_PATH,'styles/'), // 公共样式之外的，都是用css-modules进行管理
				loader: moduleStyleExtract.extract('style',['css?modules&importLoaders=1&localIdentName=[name]__[local]-[hash:base64:5]','postcss','sass?sourceMap'])
			},
			{ 
				test: /\.(gif|jpg|png)\??.*$/, loader: 'url-loader?limit=50000&name=images/[name].[ext]'
			},
			{ 
				test: /\.(woff|svg|eot|ttf)\??.*$/, loader: 'url-loader?limit=50000&name=fonts/[name].[ext]'
			},
			{
				test:/\.(js|jsx)$/,
				loader:'babel',
				include:APP_PATH,
				exclude:/node_modules/,
			},
		],
	}
};