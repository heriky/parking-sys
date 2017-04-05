
module.exports = {
	lowerKeys:function(obj){
		var other = {} ;
		for(var attr in obj){
			other[String(attr).toLowerCase()] = obj[attr]  ;
		}
		return other;
	}
}