/**
 * 处理当前登录用户
 */
import {merge} from 'lodash';
import * as ActionTypes from '../actions/index'

const initialState = {
	username: '初始值',
	loc: [],
	// 以下都是预定信息
	ordered: {
		vehicleId: "初始值",
		vehicleName: "初始值",
		location: ['0'],
		sensorId: '初始值'
	},
	nearPoint: {range:0, near:[]}
}

function user(state=initialState, action){
	switch(action.type){
		case ActionTypes.USER_INFO:
			console.log('执行了user的reducer')
			let user = action.data;
			delete user.password;
			const tmp = merge({}, state, user)
			console.log('合并后的user为:'+ JSON.stringify(tmp))
			return tmp;
		case ActionTypes.QUERY_RANGE:
			var nearPoint = action.data;
			var newData = merge({}, state, {
				nearPoint: nearPoint
			})
			debugger;
			return newData;
		default:
			return state;
	}
}

export default user;