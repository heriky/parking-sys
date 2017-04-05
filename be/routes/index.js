// var express = require('express') ;
// var router = express.Router() ;
const Router = require('koa-router');
const apiRouter = new Router();
const rootRouter = new Router() ;

const vehiclesC = require('../controllers/vehicleC') // 导入控制器
const userC = require('../controllers/userC') // 导入控制器

rootRouter.all('/', function* (next){
  this.body = '主页测试';
  this.status = 200 ;
});
rootRouter.all('/index.js.map', function* (next){ // 跳过错误的路由
  yield next;
})

// router.all('/',function(req,res){
// 	res.status(200).send('主页')
// })

apiRouter.get('/', function* (next){
  this.body = 'api 测试成功' ;
  this.status = 200 ;
})

// router.route('/api')
// 			.get(function(req,res){
// 				res.end("测试成功！Hello world！")
// 			});

apiRouter
    .post('/vehicles', vehiclesC.save) // 上位机使用, 初始化数据
    .put('/vehicles', vehiclesC.updateSensor) // 上位机使用，传感器数据有更新
    .get('/vehicles', vehiclesC.fetchAll) // 客户端调用，获取所有停车场id,name
// router.route('/api/v1/vehicles')
// 		  .post(vehiclesC.save)
// 		  .patch(vehiclesC.updateSensor)
// 		  .get(vehiclesC.fetchAll) ;

apiRouter
			.get('/vehicle/:id', vehiclesC.fetch)  // 客户端使用，获取单个停车场信息
			.get('/vehicle/order/:id', vehiclesC.order) ;  // 客户端使用，提交客户端操作(用户占用车位)


apiRouter
  .post('/login', userC.login)
  .post('/reg', userC.reg)
  .get('/userinfo/:id', userC.fetchInfo)

// 路由组合
rootRouter.use('/api/v1', apiRouter.routes(), apiRouter.allowedMethods());



module.exports = rootRouter;