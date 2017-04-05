import React,{PropTypes} from 'react' ;
import TabTitle from './TabTitle' ;
import TabContent from  './TabContent' ;
import styles from './Tab.scss';


const Tab = ({children,title})=>{
	
	return <div className = {styles.root}>
		<TabTitle title = {title}>
			{children[0]}
		</TabTitle>
		<TabContent>
			{children[1]}
		</TabContent>
	</div>
}

export default Tab ;