import { CALL_API, Schemas } from '../middlewares/api';
import fetch from 'isomorphic-fetch';
import {C} from '../env.config';


export const MONITOR_REQUEST = 'MONITOR_REQUEST';
export const MONITOR_SUCCESS = 'MONITOR_SUCCESS';
export const MONITOR_FAILURE = 'MONITOR_FAILURE';

// redux-thunk
function fetchMonitor(id){
  return {
    id,
    [CALL_API]:{
      types: [MONITOR_REQUEST, MONITOR_SUCCESS, MONITOR_FAILURE],
      endpoint: '/api/v1/vehicle/'+id,
      schema: Schemas.VEHICLE
    }
  }
}

// load the single sensor info from server
// Relies on api middleware
export function loadMonitor(id){
  if (typeof id !=='string') { console.log('来自服务端的调用, id为:',id['id'])}
  id = typeof id === 'string' ? id : id['id']; // 服务器端渲染的时候传递的是params对象
  if (typeof id === 'index.js.map') { return ;} // 排除index.js.map
  return (dispatch, getState)=>{
    // 缓存或者其他判断
    return dispatch(fetchMonitor(id))
  }
}

export const VEHICLES_REQUEST = 'VEHICLES_REQUEST';
export const VEHICLES_SUCCESS = 'VEHICLES_SUCCESS';
export const VEHICLES_FAILURE = 'VEHICLES_FAILURE';

function fetchVehicles(){
  return {
    [CALL_API]:{
      types: [VEHICLES_REQUEST, VEHICLES_SUCCESS, VEHICLES_FAILURE],
      endpoint: '/api/v1/vehicles',
      schema: Schemas.VEHICLE_ARRAY
    }
  }
}
export function loadVehicles(){
  return (dispatch, getState)=>{
    // // 预处理
    if (getState().vehicles.ids.length >0 ){
      return null;
    }
    return dispatch(fetchVehicles())
  }
}


export const RECIEVE_UPDATE_DATA = 'RECIEVE_UPDATE_DATA' ; //接收车位(传感器)状态变化的数据
export function receiveUpdateData(data){
  return {
    type: RECIEVE_UPDATE_DATA,
    data
  }
}

export const ORDERED_PATCH = 'ORDERED_PATCH';
export const ORDERED_RECEIVE = 'ORDERED_RECEIVE';  // 订单管理：预定或者取消预定
export const ORDERED_FAILURE = 'ORDERED_FAILURE';

export function userOrder(sensorId){ // {id, sensorId, status}
  return {
    sensorId,
    [CALL_API]:{
      types: [ORDERED_PATCH, ORDERED_RECEIVE, ORDERED_FAILURE],
      endpoint: "/api/v1/vehicle/order/"+sensorId,
    }
  }
}

/**
 * 获取用登录用户的信息
 * @type {String}
 */
export const USER_INFO = 'USER_INFO' ;
function userInfo(user){
  return {
    type: USER_INFO,
    data: user // 成功获取用户登录数据
  }
}

export function fetchUserInfo(userId){
  userId = typeof(userId) == 'string' ? userId : userId['id']
  const userUrl =  C.apiBase +'/userinfo/'+userId
  debugger;
  return (dispatch, getState)=>{
    if (getState().userinfo != null) {
      return null;
    }
    return fetchUser(userUrl, dispatch)
  }
}

function fetchUser(userUrl, dispatch){
  debugger;
  fetch(userUrl, {
    method: 'get',
    cache: 'default',
  })
  .then(res=>{
    if (res.ok) {
      return res.json()
    }else{
      console.log('获取预定车位信息出错，请仔细检查!')
      throw new Error('获取预定车位信息出错，请仔细检查!')
    }
  })
  .then(json=>{
    console.log('在action中，获取用户登录信息为：'+ JSON.stringify(json))
    if (json != null) {
      dispatch(userInfo(json))
    }else{
      throw new Error('Action中的错误，没有对应的登录用户。')
    }
  })
  .catch(err=>{
    console.log('在action中获取用户信息时出错：'+ err)
  })
}