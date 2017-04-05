
export const callAPIMiddleware = ({dispatch,getState})=>next=>action=>{
	// 1.抽参数
	const {
		types,
		payload,
		shouldCallAPI = ()=>true, // 解构的时候可以添加默认值
		API
	} = action ;

	//2. 过滤类型
	if(!types) return next(action) //放行,必须return

	if(!Array.isArray(types) || types.length != 3 || types.some(it=>typeof it != "string")){
		throw Error('Expected an array of three string types') ;
	}
	const {requestUrl} = payload ;
	if (!requestUrl || typeof requestUrl != 'string') {
		throw Error('Expected an string of valid url')
	}
	if(typeof API != 'function'){
		throw new Error('Expected fetch to be a function.');
	}

	if(!shouldCallAPI(getState())) return ;

	//3.开始异步调用，并生成同步action实例触发动作
	const [requestType,successType,errorType] = types;

	// 发送api请求之前触发的动作
	dispatch(Object.assign({},payload, {
		type:requestType
	}))

	return API().then(
		res=>{
			if(res.ok){
				return res.json().then(json=>{        // 内部还是一个promise，需要返回给下一个表示等待，否则，下一个是不等待这个内部的promise完成的
					dispatch(Object.assign({},payload,{
						type:successType,
						json,
					}))
				})
			}else{
				console.log("Looks like the response wasn't perfect, got status", res.status);
				return res.status;
			}
		},
		error=>{
			dispatch(Object.assign({},payload,{
				type:errorType,
				error
			}))
			return error;
		}
		);

}




