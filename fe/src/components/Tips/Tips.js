import React,{PropTypes} from 'react' ;
import styles from './Tips.scss' ;

import {browserHistory} from 'react-router';

const Tips = ({vehicle})=>(
	<div className = {styles.tips}>
		<span>Tips:</span>
		<p>1.鼠标移动至圆圈，可进行车位预约或者查看信息.</p>
		<p>2.当没有合适车位时，点击推荐按钮试试吧!</p>
		<div className= {styles.btn}>
			<button onClick={e=>{browserHistory.push(`/path?lng=${vehicle.location[0]}&lat=${vehicle.location[1]}`)}}>点击查看位置</button>
		</div>
	</div>
)

export default Tips;