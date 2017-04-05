var mqtt = require('mqtt') ;
var client = mqtt.connect('ws://localhost:8081') ;

exports.subscribe = (id)=>{
		// 订阅传主题为:'传感器变化'的消息。
	client.on('connect',()=>{
		console.log('连接mqtt代理成功！当前客户端id为:', client.id) ;

		client.subscribe('sensor_changed'+id, {qos:0},()=>{
			console.log(`订阅消息成功，当前订阅的主题消息为:sensor_changed${id}`) ;
		}) ;

	})

	client.on('close',()=>{
		console.log('mqtt连接关闭!')
	})
	client.on('reconnect',()=>{
		console.log('mqtt重新连接') ;
	})
	client.on('error',(e)=>{
		console.log('mqtt客户端发生错误:',e)
	})
}

exports.onReceivedMsg = (cb)=>{
	client.on('message',(topic,message,packet)=>{
		console.log(`接收到消息。消息主题为:${topic},消息主题为:${message}`) ;
		cb(JSON.parse(message)) ;
	})
}

exports.publish = (topic,payload)=>{
	//client.publish('presence','Hello mqtt') ;
}