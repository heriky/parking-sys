import React,{PropTypes,Component} from 'react' ;
import Tab from '../common/Tab/Tab' ;
import styles from './StatePreview.scss'
import StateIndicator from './StateIndicator' ;
import ProgressBar from '../common/ProgressBar/ProgressBar' ;

class StatePreview extends Component{
  constructor(props){
    super(props);
  }

  componentDidUpdate() {
    const { vehicle } = this.props;
    const canvas = this.canvas;
    if (!this.props.isFetching) {
      // 开始绘制饼状图
      console.log('____________调用绘图');
      drawCavans(canvas, vehicle);
    }
  }

  render(){
    const {vehicle, isFetching} = this.props;
    const { id, name, location, total, status, sensors } = vehicle;
    var d = new Date();
    var date = d.getFullYear()+'-'+(d.getMonth()+1) +'-'+d.getDate()+ '  '+d.getHours()+':'+d.getMinutes();
    return (
      <div className = {styles.container}>
      <Tab title="状态预览">
        <div>{/*这个只是为了占位置，因为Tab中规定了children[0]和children[1]*/}</div>
        {isFetching ? <div className = {styles.root}><ProgressBar /><v style = {{height:styles.minHeight}}/></div> :
          <div>
            <div className={styles["state-graphic"]}>
              <canvas width="100" height="100" ref={node=> this.canvas = node}/>
            </div>
            {/*<canvas id = 'stateGraphic'/> total,busy,idle,ordered*/}
            <StateIndicator clazz = {styles['state-info']}  total={total} {...status}/>
            <dl className = {styles['state-run']}>
              <dt className = {styles['state-title']}>更新于:</dt>
              <dd className = {styles['state-content']}>{typeof window == 'undefined' ? '' : date}</dd>
              <br />
              <dt className = {styles['state-title']}>经纬度:</dt>
              <dd className = {styles['state-content']}>{`${parseFloat(location[0]).toFixed(3)} / ${parseFloat(location[1]).toFixed(3)}`}</dd>
              <dt className = {styles['state-title']}>当前停车场:</dt>
              <dd className = {styles['state-content']}>{name}</dd>
            </dl>
          </div>
        }
      </Tab>
      </div>
    )
  }
}

function drawCavans(canvas, vehicle){
  const {total, status: { busy, idle, ordered}} = vehicle;
  console.log('busy:',busy,' idle:',idle,' ordered:', ordered)
  const ctx = canvas.getContext('2d');
  ctx.height = 100;
  ctx.width = 100 ;
  const r = ctx.width/2 ;
  const data = [busy, idle, ordered]
  const colors = ["red", "#0f0", "#32CDEC"]

  var startAngle = 0,endAngle = 0 ;
  for (var i=0,len=data.length; i< len; i++){
    ctx.beginPath();
    ctx.moveTo(r, r);
    endAngle = startAngle + 2*Math.PI*(data[i]/total);
    ctx.arc(r,r,r,startAngle, endAngle);
    startAngle = endAngle ;
    ctx.closePath();

    ctx.fillStyle = colors[i];
    ctx.fill()
  }

}

export default StatePreview;