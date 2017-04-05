var mongoose = require('mongoose');
var Schema = mongoose.Schema ;

//  vehicleSchema 是针对停车场建表，每一个document存储一个停车场的所有数据。
//  因此更合理的命名应该是ParkingLotsSchema ，但是这里改起来非常繁琐，暂时不改动
//  注意名字代表的意思即可。
var vehicleShcema = new Schema({
	id:String,		// 停车场id，用于代理数据库中的_id值。
	name:String,  // 停车场名称
	location:[String], // longitude 经度 + latitude 纬度 +　concrete具体位置
	sensors:[{
		sensorId:Number,
		distance:Number, // 传感器距离
		loc:[Number], // 如果有ZigBee定位，这里存储具体的定位信息,
		status:Number, // 0标识空闲，1标识占用,2表示预订
		statusMsg:String  // idle, busy,orderd
	}],
	meta:{
		createAt:{
			type:Date,
			default:Date.now() //时间戳
		},
		updateAt:{
			type:Date,
			default:Date.now()
		}
	}
});

// 1.先定义中间件
vehicleShcema.pre('save',function(next){
	if(this.isNew){ // 新数据到达
		this.meta.createAt = this.meta.updateAt = Date.now()
	}else{
		this.meta.updateAt = Date.now()
	}
	next();
})
//vehicleShcema.post('save',fucntion(doc){})

// 2.必要时验证数据
//vehicleShcema.path('location').validate(function(value){})

// 3. 定义静态方法
vehicleShcema.statics = {
	fetchAll:function(){
		return this.find({})
				.sort({updateAt:1})
				.exec();
	},
	findById:function(id){
		return this.findOne({_id:id})
				.exec() ;
	},
	removebyid:function(id){
		return this.remove({_id:id})
				.exec() ;
	}
}

// 4.定义实例方法
vehicleShcema.methods = {

}

// 使用schema实例生成model构造函数, 并输出模型构造函数
var Vehicle = mongoose.model('vehicle',vehicleShcema) ;
module.exports = Vehicle ;