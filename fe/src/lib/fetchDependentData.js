export default (dispatch,components,params)=>{
	console.log('服务器端加载的组件是:',components);

	const needs = components.reduce( (prev, current) => {
    return (current.needs || [])
      // .concat((current.WrappedComponent ? current.WrappedComponent.needs : []) || []) //组件上的static属性会映射到包装他的高阶组件上去
      .concat(prev);
    }, []);

	console.log('-----------------fetchDependentData中----------------')
	console.log('服务端渲染，额外的请求:',needs)
	const promises = needs.map(need=>dispatch(need(params))) // 备注二：要求该actionCreator返回promise类型
	return Promise.all(promises)
}