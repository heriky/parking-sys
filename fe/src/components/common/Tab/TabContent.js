import React,{PropTypes} from 'react' ;
import styles from './TabContent.scss' ;
import classNames from 'classnames' ;
const TabContent = (props)=>{
	const ctx = classNames('clearfix',styles.root); // 清除浮动
	return <div className = {ctx}>
		{props.children}
	</div>
}

export default TabContent ;