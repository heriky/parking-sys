import React,{PropTypes} from 'react' ;
import {Link,IndexLink} from 'react-router' ;

const NavLink = (props)=>{
	const isActive = props.isActive || false;
	// NavLink处理两类事件：1.activeClassName /activeStyle  2.IndexLink
	return props.isIndex?<IndexLink activeClassName = "nav-active" {...props}/> : <Link activeClassName = "nav-active" {...props}/>
};

export default NavLink ;
