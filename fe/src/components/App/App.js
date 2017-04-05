import React from 'react' ;
import Navbar from '../Navbar/Navbar' ;
import BreadCumb from '../BreadCumb/BreadCumb' ;

import styles from  './App.scss';
import {connect} from 'react-redux';


// 需要注意的是App相当于布局容器不同的布局模式，例如双栏布局，三栏布局等模式都可以在这个文件中写。
// App只是容器，不涉及具体的布局，因此如果在路由的时候需要变更布局的模式（两栏变三栏），则可以在App内部
// 加载不同的布局模式，布局模式可以单独的写一系列文件处理。

// App是整个前端应用级的组件（后台应用需要构造不同的整体架构，不能直接套用这个App作为根了），对于这样应用级的组件可以写在App中，内部加载各个页面的内容组件就行。

// 这个页面也可以称为Layout，可以直接将应用级的组件都以dom的形式写在这里，并添加css样式，不用再以组件的方式写了，因为全局性的组件不会复用的，只使用一次！
const App = (props)=>(           // 这里放的都是应用级复用的组件，排版和布局也在这里进行，各自应用各自排版！例如Home组件是个容器，内部布局必须在Home内部做好
  <div id='react-view'>
		<header>
			 <Navbar loc = {props.location}/>
			 {props.location.pathname == '/'?"":<BreadCumb location = {props.location}/>}
		</header>

		{props.children}
		<footer></footer>
  </div>
) ;
export default connect()(App);