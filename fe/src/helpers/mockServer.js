var express = require('express');
var app = express();
var Mock = require('mockjs');

var DTD = {
			'info':{
		 		'location|2':['@string("number",2)'],
				'status|0-1':999
		  },
		  'detail':{
		  	'total':20,
		  	'busy':8,
		  	'ordered':5,
		  	'idle':7
		  },
		  'distribute':{
		  	'total|8':999,  // 这里mockdata有错误
		  	'parking|6-9':[{
		  		'id|1-6':999,    // 这里id号的生成也有错误
		  		pos:'12',
		  		'currentStatus|1':['ordered','busy','idle']
		  	}]
		  }
		};

app.get('/api/info', function(req, res) {
    var mock = Mock.mock(DTD) ;
    console.log('来自'+req.originalUrl+'的请求，已经返回数据为：')
    console.log(mock) ;
    res.json(mock);
})

app.listen(3000, function() {
    console.log('API Server is running on http://localhost:3000')
});
