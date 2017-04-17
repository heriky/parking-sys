// var express = require('express') ;
// var path = require('path') ;
const koa = require('koa') ;
const app = koa() ;
const path = require('path');
const http = require('http');

const logger = require('koa-logger');
const mongoose = require('mongoose');

const session = require('koa-session') ;
const bodyParser = require('koa-bodyparser')

app.use(bodyParser()) ; // 配置bodyParser

// 配置session
const CONFIG = {
  key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
  maxAge: 86400000, /** (number) maxAge in ms (default is 1 days) */
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
};
app.keys = ['hk', 'This is signed characters']; // 配置session在cookie中保存的名字，默认为"koa:sess"
app.use(session(CONFIG, app)) ;

const mqttServer = require('./plugins/mqttPlugin').mqttServer ;

// 1.基本配置
app.use(logger());

app.name = "vehicle-api-server";
app.env = process.env.NODE_ENV || 'development';

const dbUrl = 'mongodb://127.0.0.1/vehicle';
mongoose.Promise = global.Promise;
mongoose.connect(dbUrl);


// app.use(bodyParser.json()) ;
// app.use(bodyParser.urlencoded({extended:true}));
// //app.use(multer({dest:'/tmp'}).array('uploadFile'));
// app.use(cookieParser) ;
// //var dbUrl = 'mongodb://hankang:HANkang3402510@127.0.0.1:27017/vehicle';
// var dbUrl = 'mongodb://127.0.0.1/vehicle';
// mongoose.connect(dbUrl) // 首页开启数据库连接
// mongoose.Promise = global.Promise ; // mongoose在4.0之后需要插入外部的的Promise组件

// app.use(session({
// 	secret: 'There is 128 chars recommended',
// 	cookie: {
// 	    maxAge: 1800 * 1000,
// 	    httpOnly: true
// 	},
// 	store: new mongoStore({
// 	    url: dbUrl,
// 	    collection: 'sessions'
// 	}),
// 	resave: true,
// 	saveUninitialized: false
// }));


//2. 配置生产环境

// if ('dev' === app.get('env')) {
//     app.set('showStackError', true);
//     app.use(logger(':method :url :status'));
//     app.locals.pretty = true;
//     mongoose.set('debug', true);
// }

// 3. 路由总入口

var router = require('./routes') ;
app.use(router.routes()).use(router.allowedMethods()) ;

// 4.处理错误
// // 500 错误
// app.use(function(err,req,res,next){
// 	if (err) {
// 		console.log(err.stack) ;
// 		res.status(500).send('Server Internal Error:'+err.message)
// 		throw err;
// 	}else{
// 		next() ;
// 	}
// })
// // 404错误，前面路由全部不匹配的情况下，才会出现404
// app.use(function(err,req,res,next){
// 	var err = new Error('404 NOT FOUND!') ;
// 	console.log(err.stack) ;
// 	res.status(404).send('404 NOT FOUND!') ;
// })

app.on('error', function*(err, ctx){
  console.error(err.message || 'Server internal error!');
})


// 5.开启监听

// mqtt
mqttServer.on('ready',()=>{
	console.log('Mqtt Server is running on port 1883\n','Websocket run on port 8081') ;
})


// // http
// app.on('error',onError)
// app.on('listening',function(){
// 	console.log('正在监听')
// })

var port = process.env.PORT || 3000 ;

// 设置https服务，app在这里充当HTTP Server的回调
// var https = require('https')
// https.createServer(options,app).listen(port,function(){
// 	console.log('Server is running on port '+port)
// })
// app.listen(port,function(){
// 	console.log('api server is running on port '+port)
// })
http.createServer(app.callback()).listen(3000,err=>{
  console.log('Api Server is running on port '+ port)
})

// function onError(error) {
//   if (error.syscall !== 'listen') {
//     throw error;
//   }

//   var bind = typeof port === 'string'
//     ? 'Pipe ' + port
//     : 'Port ' + port;

//   // handle specific listen errors with friendly messages
//   switch (error.code) {
//     case 'EACCES':
//       console.error(bind + ' requires elevated privileges');
//       process.exit(1);
//       break;
//     case 'EADDRINUSE':
//       console.error(bind + ' is already in use');
//       process.exit(1);
//       break;
//     default:
//       throw error;
//   }
// }
