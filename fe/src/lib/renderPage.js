export default (appHtml,initialState)=>(

`
	<!DOCTYPE html>
	<html lang="zh">
	<head>
	    <!-- META 一般设置 -->
	    <meta charset="UTF-8">
	    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
	    <meta name="viewport" content="width=device-width,initial-scale=1,maximun-scale=1,user-scalable=no" >
	    <!--设置IE浏览器有限使用edge渲染 -->
	    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	    <meta name="HandheldFriendly" content="true">
	    <title>车位监控系统</title>

	    <!-- link优化 -->
	    <link rel="shortcut icon" href="/static/favicon.ico">
	    <link rel="icon" href="/static/favicon.ico">
	    <link href="/static/dist/common.css" rel = 'stylesheet'/>
			<link href="/static/dist/module.css" rel = 'stylesheet'/>

	    <!-- 国内双核浏览器，特别是360，使用渲染引擎从左到右 -->
	    <meta name="renderer" content="webkit|ie-comp|ie-stand">
	    <!-- seo优化 -->
	    <meta name="author" content="">
	    <meta name="keywords" content="">

	    <!-- html shim -->
	    <!--[if lt IE 9]>
	      <script src="http://cdn.bootcss.com/html5shiv/3.7.2/html5shiv.min.js"></script>
	    <![endif]-->
	    <script src="http://cdn.bootcss.com/es5-shim/4.5.8/es5-shim.min.js"></script>
	    <script src="/static/scripts/browserMqtt.js"></script>
	    <script type="text/javascript" src="http://webapi.amap.com/maps?v=1.3&key=f4431845cb5ded19801ecbb0885c9d30"></script>
	</head>
	<body>
	    <div id="react-app">${appHtml}</div>
	    <script>
				window.__INITIAL_STATE__ = ${JSON.stringify(initialState)}
	    </script>
	    <script src='/static/dist/vendor.js'></script>
	    <script src='/static/dist/bundle.js'></script>
	</body>
	</html>
`
) ;