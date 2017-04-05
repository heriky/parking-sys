var mongoose = require('mongoose') ;

mongoose.connect('mongodb://127.0.0.1:27017/vehicle')
mongoose.Promise = global.Promise;

var Vehicle = require('./models/vehicleM') ;

var _vehicle = new Vehicle({
	id:'1',
	name:'停车场',
	location:[],
	sensors:{
		sensorId:233,
		distance:12222,
		loc:[11,222],
		status:"",
		statusMsg:""
	}

})

_vehicle.save().then(function(vehicle,err){
	if (err) {
		console.log(err.message) ;
		throw err;
	}
	console.log(vehicle.toString()) ;

})