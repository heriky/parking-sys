import React,{PropTypes} from 'react' ;
import styles from './ProgressBar.scss' ;
import classNames from 'classnames' ;

const ctx = classNames(styles.root,'circle-spinner') ;
const ProgressBar = (props)=>(
	<div className = {ctx}>
		<i></i>
	</div>
)

export default ProgressBar;