import Mock from 'mockjs' ;
const mockData = Mock.mock('http://localhost:8080/api/info',{
	'location|2':['@string("number",2)'],
	'status|0-1':999
})
export default mockData;

// info:{                       // 返回的json格式{loaction:[],status:1}
// 	location:["",""],
// 	status:1,
// 	isFetching:false
// },