import React,{PropTypes} from 'react' ;
import Tab from '../common/Tab/Tab' ;
import styles from './ParkingState.scss'
import ParkingItem from './ParkingItem2' ;
import StateIndicator from '../StatePreview/StateIndicator' ;
import ProgressBar from '../common/ProgressBar/ProgressBar'

// 这里通过clearfix向Tab内部添加自定义的样式，按要求覆盖样式。
const ParkingState = ({sensors, onOrderClick, isFetching})=>(
  <div className = {styles.container}>
  <Tab title="停车分布" >
    <StateIndicator clazz = {styles.indicator}/>
    {
      isFetching ? <div className = {styles.root}><ProgressBar /><v style = {{height:styles.minHeight}}/></div> : <div>
      {sensors.map((sensor,index)=>
        <div className = {styles.wrapper} key = {sensor.id}>
          <ParkingItem {...sensor} sensorFetching = {isFetching} onOrderClick = {(target)=>onOrderClick(sensor.id, target)}/>
        </div>
      )}
    </div>
  }
  </Tab>
  </div>
)


export default ParkingState;