const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const userSchema = new Schema({
	username: String,
	password: String,
	ordered: {
		vehicleId: String,
		vehicleName: String,
		location: [String],
		sensorId: String
	} ,// 预定的车位编号
	loc: [Number], // 记录用户当前的位置
})

const User = mongoose.model('user', userSchema);

module.exports = User;