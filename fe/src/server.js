import express from 'express';
import path from 'path'
import httpProxy from 'http-proxy';

import React from 'react' ;
import {RouterContext,match} from 'react-router'
import {renderToString} from 'react-dom/server'
import { Provider } from 'react-redux' ;


//import {createLocation} from 'history/lib/LocationUtils'; // 用这个消除index.js.map 的恶心bug
import routes from './routes2'
import configureStore from  './store/configureStore' ;
import renderPage from './lib/renderPage' ;
import fetchDependentData from './lib/fetchDependentData'

// 配置wepack-middleware
const webpack = require('webpack');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackDevMiddleware = require('webpack-dev-middleware');
const config = require('../build/webpack.prod.config') ;

const app = express() ;

const compiler = webpack(config);
app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }))
app.use(webpackHotMiddleware(compiler));


// 配置http和socket服务器， 配置mqtt客户端
const server = require('http').Server(app);
const mqtt = require('mqtt');
const io = require('socket.io')(server);


const resourceDir = path.resolve(__dirname, '../../resources');
app.use(express.static(resourceDir, {maxAge: '365d'}));


/***********************************1. 代理费服务器*****************************/
const proxy = httpProxy.createProxyServer({
  target: 'http://localhost:3000/api',
});

app.use('/api',(req,res)=>{
	// 处理代理转发
	proxy.web(req,res) ;
})

proxy.on('error', (error, req, res) => {  //proxy错误处理s
  let json;
  if (error.code !== 'ECONNRESET') {
    console.error('proxy error', error);
  }
  if (!res.headersSent) {
    res.writeHead(500, {'content-type': 'application/json'});
  }

  json = {error: 'proxy_error', reason: error.message};
  res.end(JSON.stringify(json));
});



/**************************2.服务器端路由渲染**************************************/
const store = configureStore() ;

// 作为中间件使用
app.use((req,res, next)=>{
  if (req.originalUrl.includes('index.js.map')) {
    next();
  }
	//const location = createLocation(req.url);

	match({routes, location: req.url},(err,redirect,renderProps)=>{ // 传入一个对象和回调！！
		console.log('当前请求的url：' + req.url)

		if(err){
			console.info(err) ;
			return res.status(500).send(err.message) ;
		}else if(redirect){
			return res.status(302).redirect(redirect.pathname + redirect.search) ;
		}else if(!renderProps){
			return res.status(404).send('Not Found')
		}
		// 处理完异常情况，接下来正式渲染页面
		// 服务器端同步渲染
		//服务器端，同步处理组件初始的依赖数据,依赖数据返回之前尽量不要renderToString，否则前后端渲染不一致
		fetchDependentData(store.dispatch,renderProps.components,renderProps.params)
			.then(()=>{ // then 调用时，store状态已经发生了变化
				// 将app应用渲染成html字符串
				// renderToString()的时机最好放在依赖数据全部返回，store状态变化后，以此【避免前后端不一致问题】
				const appHtml = renderToString(
					<Provider store = {store}>
						<RouterContext {...renderProps}/>
					</Provider>
				);
        console.log('服务器端渲染初始状态为:', store.getState())
				return renderPage(appHtml,store.getState()) // 内部promise执行完成后相当于dispatch了新动作，导致state更新了。！！
			})
			.then(html=>{
				return res.status(200).end(html)
			})
			.catch(err=>{
				console.log(err.message) ;
				res.status(500).send('抓取数据错误！！')
			})
	})
});


// 不直接用app，因为server里面包含着socket.io的服务
server.listen(3001,()=>{  // 渲染服务器(api代理服务器)运行在3001端口
	console.log('Render Server is running on port 3001') ;
})

io.on('connection', function (socket) {
	console.log('成功连接至socket.io服务器') ;
});

