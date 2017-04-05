var mqtt = require('mqtt') ;
var client = mqtt.connect('mqtt://test.mosquitto.org') ;
client.on('connect',()=>{
	client.subscribe('presence') ;
	client.publish('presence','Hello mqtt') ;
})

client.on('message',(topic,message,packet)=>{
	console.log(message.toString()) ;
	client.end() ;
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

var fs = require('fs');



