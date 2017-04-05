import React,{PropTypes} from 'react' ;
import styles from './BreadCumb.scss' ;
import _ from 'lodash' ;
import {Link,IndexLink} from 'react-router'

const BreadCumb = ({location})=>{
	const crumbMap = _.zipObject(['home','monitor','recommend','api','feedback'],['首页','监控','推荐','API','反馈']);
	const breadCrumbs = ['home',...(_.compact(location.pathname.split('/')))] ;
	const activeStyle = {color:"#333",textDecoration:"none"}
	return <ul className={styles.root}>
		{
			breadCrumbs.map((crumb,index)=>
				<li key = {index} className={styles["bread-item"]}>
					{crumb =='home' ? <IndexLink to='/' activeStyle = {activeStyle}>{crumbMap[crumb]}</IndexLink> : <Link to={`/${crumb}`} activeStyle = {activeStyle}>{crumbMap[crumb]}</Link>}
				</li>
			)
		}
	</ul>
}

export default BreadCumb ;