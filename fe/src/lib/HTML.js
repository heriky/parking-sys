export default function HTML({appHtml,initialState}){
	return(
	<html lang='zh'>
		<head>
		    {/*<!-- META 一般设置 -->*/}
		    <meta charset="UTF-8">
		    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
		    <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no" >
		   
		    {/*<!--设置IE浏览器有限使用edge渲染 -->*/}
		    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
		    <meta name="HandheldFriendly" content="true">
		    <title>Document</title>

		    {/*<!-- link优化 -->*/}
		    <link rel="shortcut icon" href="favicon.ico">
		    <link rel="icon" href="favicon.ico">
		    <link rel="stylesheet" type="text/css" href="">

		    {/*<!-- 国内双核浏览器，特别是360，使用渲染引擎从左到右 -->*/}
		    <meta name="renderer" content="webkit|ie-comp|ie-stand">
		    {/*<!-- seo优化 -->*/}
		    <meta name="author" content="">
		    <meta name="keywords" content="">

		    {/*<!-- html shim -->*/}
		    <div style = {{display:'none'}} dangerouslySetInnerHTML = {{__html:`
					<!--[if lt IE 9]>
					  <script src="//cdn.bootcss.com/html5shiv/3.7.2/html5shiv.min.js"></script>
					<![endif]-->
		    `}}/>
		    
		</head>
		<body>
		    <div id="react-app" dangerouslySetInnerHTML = {{__html: appHtml}}>
		    </div>
		    <script dangerouslySetInnerHTML = {{
		    	`window.__INITIAL_STATE__ = ${JSON.stringify(initialState)}`
		    }}>
        </script>
		    <script src="/bundle.js"></script>
		</body>
	</html>
	)
}