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
			'webpack-dev-server/client?http://localhost:8080',
			'webpack/hot/only-dev-server'
	],
	output:{
		path:BUILD_PATH,
		filename:'bundle.js', // 这里加入[hash]表示使用hash来防止js文件缓存
	},
	plugins:[
		new HtmlwebpackPlugin({
			title:'React Component Test',
			template:path.resolve(RESOURCE_PATH,'template.html'),
			filename:'index.html',
			// chunks 指定要引用entry文件中哪个几个入口个文件
			chunks:'app',
			// 表示script插入标签中
			inject:'body'
		}),
		new webpack.optimize.UglifyJsPlugin({minimize:true}),
		//new ExtractTextPlugin('[name].[contenthash].css', { allChunks: true})
		commonStyleExtract,
		moduleStyleExtract // 添加不同的extract插件
	],
	devServer:{
		//historyApiFallback:true, 全部写在命令行
		//hot:true,
		//inline:true,
		//progress:true,
		// contentBase:'./src/',
		// port: 8080,
		// publicPath:''
		// proxy: {
  //     '*': {             // 过滤对8080/api路由的请求到3001服务器上
  //     	target:'http://127.0.0.1:3001',
  //     	secure:false
  //     }
  //   },
    host: '127.0.0.1'
	},
	devtool:'eval-source-map',
	resovle:{
		extensions:['','.js','.jsx'] //必须先写''否则会找index.js.js和index.js.jsx
		,
		alias:{
			//jquery:'../dist/jquery.min.js'
		}
	},

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
				//以下这种方式会导致每一个css-module都会以style的方式插入，这样会导致很多style标签
				//loaders:['style','css?modules&importLoaders=1&localIdentName=[name]__[local]-[hash:base64:5]','postcss','sass?sourceMap'],

				// 这里放的是需要css_modules局部处理的样式，importLoaders=1选项的使用是为了将css-module和postCss整合
				// 需要明确的是API的使用
				// ExtractTextPlugin.extract([notExtractLoader], loader, [options]) Creates an extracting loader from an existing loader.
				// 总的来说extract函数接收一个输出的css文件，如果直接将style-loader连接在loader链上，最终输出的是js代码，因为
				// style-loader干的事情就是将css通过js代码以style标签的方式插入页面的，因此如果想要用extract要么将style作为第一个参数notExtractLoader，
				// 要么直接写成extract(['css','postcss','sass'])，要么写成extract('style',['css','postcss','sass'])
				loader: moduleStyleExtract.extract('style',['css?modules&importLoaders=1&localIdentName=[name]__[local]-[hash:base64:5]','postcss','sass?sourceMap'])
			},
			{
				// 大于50kb的文件都会被输出到output中path的目录中去，按照name中所指定的路径和格式
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
			//{ test: require.resolve("./src/js/tool/swipe.js"),  loader: "exports?swipe"}
			//以上配置用于暴露全局变量，例如jQuery等
		],
	}
};