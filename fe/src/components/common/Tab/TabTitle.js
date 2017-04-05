import React,{PropTypes} from 'react' ;
import styles from './TabTitle.scss' ;

const TabTitle = ({title,children})=>(
	<div className={styles.root}>
		<h2 className = {styles.desc}>{title}</h2>
		<div className = {styles["title-indicator"]}></div>
		{children}
	</div>
);

export default TabTitle ;