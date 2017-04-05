
exports.subscribe = function(io){
	var client  = mqtt.connect('mqtt://localhost:1883');
	client.on('connect', function () {
		client.subscribe(`sensor_changed${id}`) ;
		console.log('连接mqtt代理成功！当前客户端id为:'+id)
	});

	client.on('message', function (topic, message) {
	  // message is Buffer
	  console.log('收到mqtt的消息内容为:' + message,',其类型为' + typeof message);
	  client.end();
		
	  io.emit(topic,{data: message}) ; 
	});
}
