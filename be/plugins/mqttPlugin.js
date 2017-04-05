const mqttConst = require('./mqtt-constants') ;
const USER_OPERATE = mqttConst.userOperate ;
const SENSOR_CHANGED  = mqttConst.sensorChanged;

const mosca = require('mosca') ;

var pubsubsettings = {
  //using ascoltatore
  type: 'mongo',
  url: 'mongodb://localhost:27017/mqtt',
  pubsubCollection: 'ascoltatori',
  mongo: {}
};

const MqttServer = new mosca.Server({
	backend:pubsubsettings,
	port: 1883,
	http:{
		port:8081,
		bundle:true,
		static: './'
	}
}) ;

MqttServer.on('clientConnected',(client)=>{
	console.log('client connected',client.id) ;
}) ;
MqttServer.on('clientDisconnected',(client)=>{
	console.log('Clinet Disconnected:',client.id)
})

/**
 * 监听主题消息,如果有某个mqtt客户端发布消息了，会集中在这里处理
 */

MqttServer.on('published',(packet,client)=>{
	const topic = packet.topic;
	switch (topic) {
		case USER_OPERATE:
			// 来自于用户在客户端"占车位"的操作，在改变数据库状态后发布这样一个消息
			console.log('【服务端收到用户消息消息】:\n',`主题${topic}`,`负载${packet.payload}`)
			break;
		case SENSOR_CHANGED:
			console.log('【服务端收到传感器变化消息】:\n',`主题${topic}`,`负载${packet.payload}`) ;
			break;
		default:
			break;
	}
})
exports.mqttServer = MqttServer ;