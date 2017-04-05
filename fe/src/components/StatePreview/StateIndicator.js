import React,{PropTypes} from 'react' ;
import styles from './StatePreview.scss';

const StateIndicator = ({clazz,total,busy,idle,ordered})=>{ // 组件内容一样，只是样式不一样。

	return <ul className = {clazz}>
			<li>
				<i className="icon-state"></i>
				<span>  总车位:  {total}</span>
			</li>
			<li>
				<i className="icon-state bg-red"></i>
				<span>  已占用:  {busy}</span>
			</li>
			<li>
				<i className="icon-state bg-blue"></i>
				<span>  已预约:  {ordered}</span>
			</li>
			<li>
				<i className="icon-state bg-green"></i>
				<span>  空闲位:  {idle}</span>
			</li>
		</ul>
}
export default StateIndicator ;