const Vehicle = require('../models/vehicleM'); // 导入模型
const User = require('../models/UserM');
const TRIGGER_DISTANCE = 3 ; // 触发停车事件的距离

const _ = require('lodash');

const mqttConst = require('../plugins/mqtt-constants') ;
const USER_OPERATE = mqttConst.userOperate ;
const SENSOR_CHANGED = mqttConst.sensorChanged ;
const mqttServer = require('../plugins/mqttPlugin').mqttServer ;


/**
 * 【上位机调用】
 * 验证上位机id是否合法.
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.validateId = function* (next) {
	var vehicleObj = this.request.body ;
	var id = vehicleObj.id;

	const vehicle = yield Vehicle.findById(id);
	if (vehicle == null) {
		this.status = 400;
		return this.body = { code: 400, error: '未找到的id值，请重新配置软件！'}
	}
	this.body = {code: 200, message: 'ok'}
}

/**【上位机调用】
 * 处理停车场初始化数据的存储，并返回唯一_id。当一个新的应用部署时，需要初始化停车场数据，以获取当前停车场
 * 的位置信息（定位使用）、名称、传感器初始状态等信息。数据被存储入数据库之后会生成唯一的_id，
 * 将该_id返回，作为停车场之后数据提交的凭证。初始化过后，如果某个传感器的数据变化要提交服务器时，
 * 则使用该_id作为凭证更新sensors中的数据。
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.save = function* (next){ // 将sensorId变成："停车场id_传感器id"的形式
	var vehicleObj = this.request.body ;

	var requiredInfo = Object.assign({},vehicleObj,{
		sensors:vehicleObj.sensors.map((sensor,index)=>{
			const currentDistance = parseInt(sensor.distance) ;
			return {
				sensorId: 	sensor.sensorId,
				loc: 		  	sensor.loc,
				status :  	currentDistance > TRIGGER_DISTANCE ? 0 : 1,
				statusMsg : currentDistance > TRIGGER_DISTANCE ? "idle" : "busy" ,
				distance: 	currentDistance,
			} ;
		})
	});

	if (vehicleObj.id) {
		requiredInfo._id = vehicleObj.id; // 如果当前id已经存在，则save自动变成update,防止用户多次初始化造成的冗余_id
	}
	try {
		yield Vehicle.remove({name: requiredInfo.name}); // 如果有冗余，则删除即可。
		const savedVehicle = yield new Vehicle(requiredInfo).save();
		this.status = 200 ;
		this.body = savedVehicle ;
	} catch(e) {
		console.log(e);
		throw e;
	}
}

/**【上位机调用】
 * 传感器数据发生了变化，更新相关传感器数据。
 * 依据停车场唯一_id和sensorId, 可以准确查询到相关sensor的值，并更新
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.updateSensor = function* (next){
	var patchData = this.request.body;

	var id = patchData.id; // 停车场的id
	var patchedSensor = patchData.patchedSensor ; // 数据发生更新了的传感器

	// 当前变化的传感器的基本信息
	var sensorId = patchedSensor.sensorId;
	var distance = patchedSensor.distance ;
	var loc = patchedSensor.loc;
	var status = distance > TRIGGER_DISTANCE ? 0 : 1;
	var statusMsg = distance > TRIGGER_DISTANCE ? "idle" : "busy" ;

	var prevStatusMsg ;

	var preVehicle = yield Vehicle.findById(id) ;
	if (preVehicle == null) {
		this.status = 400 ;
		return this.body = {code: 400, error: '无效的停车场id'}
	};

	// 更新操作
	preVehicle.sensors.forEach((sensor, index)=>{
		if (sensor.sensorId == sensorId) {
			console.log(sensor.sensorId, sensorId)
			prevStatusMsg = sensor.statusMsg ; //  这里便于客户端更新消息,找出原始的状态

			Object.assign(sensor,{
				distance: distance,
				loc: 			loc,
				status: 	status,
				statusMsg:statusMsg
			});
			return ; // 找到后终止
		}
	});

	// 向客户端代理服务器推送消息，并向上位机返回正确的返回码
	const nextVehicle = yield preVehicle.save();

	const message = {
		topic:SENSOR_CHANGED+id, // 当前停车场的id标志
		payload:JSON.stringify({ // payload要求必须是字符串
			sensorId: id+'_'+sensorId,
			status,
			statusMsg,
			prevStatusMsg,
		}),		// 当前停车场的所有数据
		qos:0,
		retain:false
	};

	mqttServer.publish(message, ()=>{ // 向代理服务器发送"传感器变化"消息
		console.log(`上位机更新，主题消息${mqttConst.sensorChanged+id}成功发送！`) ;
	})
	this.status = 201;
	// this.body = nextVehicle;
	this.body = { code: 201, message: 'ok' } ;
}

/**
 * 【客户端调用】
 * 客户端获取当前数据库中所有停车场列表。引导用户进一步点击选择。
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.fetchAll = function* () {
	const vehicles = yield Vehicle.fetchAll() ;
	this.status = 200 ;
	// this.body = {
	// 	ids: vehicles.map(vehicle=> vehicle._id),
	// 	names: vehicles.map(vehicle=> vehicle.name)
	// }
	this.body = vehicles.map((vehicle, index)=>{
		var sensors = vehicle.sensors;
		var id = vehicle._id;
		return {
			id,
			name: vehicle.name,
		}
	})

}

/**
 * 【客户端调用】
 * 获取特定停车场的车位信息。
 * 调用url格式为 /api/v1/vehicles/fjlasdfjladfj2100ulsdfljkjl (最后面为id值)
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.fetch = function* (next){
	const id = this.params.id || '00000';
	console.log('当前id为:'+id) ;

	const vehicle = yield Vehicle.findById(id);
	if (vehicle == null) {
		this.status = 400 ;
		return this.body = { code: 400, error: '无效的停车场id'}
	}
	const sensors = vehicle.sensors ;

	const information = {
		id,
		name: vehicle.name,
		location: vehicle.location,
		total: sensors.length,
		status: {
			idle: sensors.filter(sensor => sensor.status === 0).length,
			busy: sensors.filter(sensor=> sensor.status === 1).length,
			ordered: sensors.filter(sensor => sensor.status === 2).length
		},
		sensors:sensors.map((sensor, index)=>{
			return {
				id: id+'_'+sensor.sensorId,
				pos:[998,998],
				currentStatus:sensor.statusMsg
			}
		})
	}

	this.status = 200 ;
	this.body = information;
}

/**
 * 【客户端调用】
 * 预定车位时调用次方法，将数据库中车位状态改变为"ordered"
 * @param  {RequestStream} req  请求对象
 * @param  {ReponseStream} res  相应对象
 * @return {null}          null
 */
exports.order = function* (next) {
	const id = this.params.id; // 这个id的组成是vehicleid_sensorid
	const tmp = id.split('_');
	const vehicleId = tmp[0] ;
	const sensorId = tmp[1] ;

	const vehicle = yield Vehicle.findById(vehicleId);
	if (vehicle == null) {
		this.status = 400 ;
		return this.body = {code: 400, error: '无效的停车场id'};
	}

	const sensors = vehicle.sensors
	sensors.forEach(function(sensor,index){
		if (sensor.sensorId == sensorId) {  // 找到相应的id值，将其变成"预订状态",状态值为2
			sensor.status = 2 ;
			sensor.statusMsg = 'ordered' ;
			return; // 提早结束
		}
	}) ;

	const updatedVehicle = yield vehicle.save();

	if (updatedVehicle == null ) {
		this.status = 400 ;
		return this.body = {code: 400, error: '预定出错！'};
	}

	/**
	 * 更新成功后写入用户数据
	 */
	try{
		// 登录用户再预定车位后进行信息存储，以便于再次调用
		var user = this.session.user;
		var newUser =_.merge({}, user, {
			ordered: {
			  vehicleId,
			  vehicleName: vehicle.name,
			  location: vehicle.location,
			  sensorId
			}
		});
		var rs = yield User.update({_id: user._id}, newUser).exec();

		if (rs == null) {
			console.log('用户预定数据保存出错，请仔细检查代码！')
			throw new Error('用户预定数据保存出错，请仔细检查代码！');
		}
	}catch(err){
		console.log(err)
	}

	console.log('用户预定车位操作成功！发送消息到上位机！'+USER_OPERATE+vehicleId) ;
	// 上位机与数据库中的senseorid是单纯的传感器编号， 页面客户端中的sensorID是id_sensorId
	mqttServer.publish({
		topic: USER_OPERATE+vehicleId,
		payload: JSON.stringify({
			vehicleId,
			sensorId,
			currentStatusMsg:'ordered'
		})
	});

	console.log('向其他用户推送当前改变的车位状态');
	var message = {
		topic:mqttConst.sensorChanged+vehicleId, // 当前停车场的id标志
		payload:JSON.stringify({
			sensorId: id,
			status: {},
			statusMsg: 'ordered',
			prevStatusMsg: 'idle',
		}),		// 当前停车场的所有数据
		qos:0,
		retain:false
	};
	mqttServer.publish(message,()=>{
		console.log(`伪sensor_changed消息：${mqttConst.sensorChanged+vehicleId}成功发送！共享占用状态`) ;
	});

	// 向预定车位者回复消息
	this.status = 201;
	this.body = {
		isOK: true,
		id,
		sensorId
	}
}

