import React,{propTypes, Component} from 'react' ;
import {connect} from 'react-redux';
import { browserHistory } from 'react-router' ;
import fetch from 'isomorphic-fetch'

import {loadMonitor, receiveUpdateData, userOrder} from '../actions/index';

import ParkingState from '../components/ParkingState/ParkingState2';
import StatePreview from '../components/StatePreview/StatePreview2';
import Tips from '../components/Tips/Tips';

class Monitor extends Component{
  constructor(props){
    super(props);
    this.handleOrder = this.handleOrder.bind(this);
  }

  static needs = [
    loadMonitor
  ]

  // 处理预订车位操作
  handleOrder(sensorId){
      // 检测登录状态
      try{
        let user = JSON.parse(sessionStorage.getItem('_user'));
        // 向服务器发送"预定"请求, 同时更新已登录用户的信息
        this.props.dispatch(userOrder(sensorId))
      }catch(err){
        alert('请登陆后操作!')
      }
  }

  componentDidMount(){
    // 获取当前页面停车场的具体信息
    const {dispatch, params:{id}} = this.props;
    if (id==null || id.length !=24) { return browserHistory.push('/monitor') }
    dispatch(loadMonitor(id));

    // 开启服务器推送监听
    var mqttClient = require('../lib/mqttClient') ;
    mqttClient.subscribe(id) ;
    mqttClient.onReceivedMsg(data=>{// data{sensorId, status, statusMsg, prevStatusMsg}
      dispatch(receiveUpdateData(data)) ;
    })
  }

  render(){
    return (
      <div>
        <StatePreview
          vehicle={this.props.vehicle}
          isFetching = {this.props.isFetching.vehicleFetching}/>
        <ParkingState
          sensors = {this.props.sensors}
          onOrderClick = {this.handleOrder}
          isFetching = {this.props.isFetching.orderFetching}
          />
        <Tips vehicle={this.props.vehicle}/>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Monitor)

function mapStateToProps(state, ownProps){
  const vehicleId = ownProps.params.id;
  const vehicleTable = state.entities.vehicles;
  const sensorTable = state.entities.sensors;

  const vehicle = vehicleTable[vehicleId] || {}; // 初始化的时候并没有真实的sensor数据只有name和id
  const sensors = (vehicle.sensors|| [] ).map(sensorId=>sensorTable[sensorId]) || [];
  const isFetching = state.isFetching;

  return {
    vehicle,
    sensors,
    isFetching
  }
}
