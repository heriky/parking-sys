import React,{PropTypes} from 'react' ;
import styles from './ParkingItem.scss'
import clazz from 'classnames';  // 合并样式
import ProgressBar from '../common/ProgressBar/ProgressBar' ;

const ParkingItem = ({id,pos,currentStatus, onOrderClick, sensorFetching})=>{
  let statusStyle ;
  switch (currentStatus) {
    case 'busy':
      statusStyle = styles.busy;
      break;
    case 'ordered':
      statusStyle = styles.ordered;
      break;
    case 'idle':
      statusStyle = styles.idle;
      break;
    default:
      break;
  }
  const finalStyle = clazz(styles.root,statusStyle)
  return (
    <div className = { styles.extra } onClick = {e =>{
      if (currentStatus === 'ordered') {
        alert('无效的操作，该车位已被预订!')
        e.stopPropagation() ;
        return ;
      }
      if (currentStatus === 'busy') {
        alert('车位是占用状态，别乱点了！');
        e.stopPropagation() ;
        return ;
      }
      // 触发车位预定,向服务器请求
      onOrderClick(e.target)
    }
    }>
      <div className={finalStyle}>
        <div style = {{display:'inline-block',width:'100%',verticalAlign:'middle'}}>
          <span>#{id.split('_')[1]}</span>
        </div>
        <i style = {{display:'inline-block',height:'100%',verticalAlign:'middle'}}></i>
      </div>
      <div className= { styles.backface }>
        { sensorFetching!==undefined && sensorFetching === true ? <ProgressBar /> : <span>点击预订车位</span> }
      </div>
    </div>

)}

export default ParkingItem;