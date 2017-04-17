const User = require('../models/UserM');

exports.reg = function* (next){
	const username = this.request.body.username;
	const password = this.request.body.password;

/**
 * username: String,
	password: String,
	ordered: {
		vehicleId: String,
		vehicleName: String,
		location: [String],
		sensorId: String
	} ,// 预定的车位编号
	loc: [Number], // 记录用户当前的位置
 */
	const user = new User({
		username: username,
		password: password,
		ordered:{
			vehicleId: null,
			vehicleName: null,
			location: [],
			sensorId: null
		},
		loc: [0,0]
	});

	// 禁止重复注册
	var existed = yield User.findOne({username: username}).exec();
	if (existed != null) {
		this.status = 200 ;
		return this.body = 'ok'
	}

	const rs = yield user.save();
	if (rs != null) {
		this.status = 200 ;
		console.log('注册成功')
		return this.body = 'ok';
	}
	this.status = 500;
	console.log('注册失败')
	return this.body = 'fail'
}

exports.login = function* (next){
	const username = this.request.body.username;
	const password = this.request.body.password;

	var user = yield User.findOne({username, password}).exec();

	if (user != null) {

		this.status = 200 ;
		this.session.user = user;
		console.log('登录成功,写入session');

		delete user.username;
		delete user.password; // 删除敏感信息
		return this.body = {result: 'ok', user}
	}
	return this.body = {result: 'fail'}
}


exports.fetchInfo = function* (next){
	// if (this.session.user == null) {       // 用户验证有错误的，因为是cookie-based session 所以失效
	// 	console.log('未登录的用户，不能返回预定车位的信息！')
	// 	return ;
	// }

	try{
		const userid = this.params.id;
		var user = yield User.findOne({_id: userid}).exec();

		const ordered = user.ordered;
		this.type = 'json';
		this.status = 200;
		console.log('开始返回：'+ JSON.stringify(user));
		this.body = user;
	}catch(err){
		console.log(err)
	}
}

