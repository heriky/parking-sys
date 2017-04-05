const USER_OPERATE = "user_operation" ;
const SENSOR_CHANGED = "sensor_changed" ; // 上位机也可以做成消息发布模式，这个为预留

module.exports = {
	userOperate:USER_OPERATE,
	sensorChanged:SENSOR_CHANGED
}