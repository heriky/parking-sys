import {merge, union} from 'lodash';

import * as ActionTypes from '../actions/index';

const initialState = {
  vehicles: {},
  sensors: {}
}

// 实体数据库的特点是: 结构相同，每次仅仅只是合并变化，
// 因此，可以直接进行全局处理
// 实体的整体部分统一处理，部分跟新个别处理
export default function entities(state=initialState, action){
  if (action.res && action.res.entities) {
    return merge({}, state, action.res.entities);
  }else{
    return {
      vehicles: vehicles(state.vehicles, action),
      sensors: sensors(state.sensors, action)
    }
  }
}

// function order(state, action){
//   switch(action.type){
//     case ActionTypes.ORDERED_PATCH:
//     case ActionTypes.ORDERED_FAILURE:
//       return state;
//     case ActionTypes.ORDERED_RECEIVE: // 返回ok
//       //return state; 预定成功
//       const vehicleId = action.sensorId.split('_')[0];
//       return merge({}, state[vehicleId], {
//         status: {
//           idle: state[vehicleId].idle -1,
//           ordered: state[vehicleId].ordered + 1
//         }
//       })
//   }
// }

function vehicles(state=initialState.vehicles, action){
  switch(action.type){
    case ActionTypes.ORDERED_RECEIVE:
      var vehicleId = action.sensorId.split('_')[0];

      // 同一个车位就不要多次变化了
      debugger;
      return merge({}, state, {
        [vehicleId]: merge({}, state[vehicleId], {
          status: {
            idle: state[vehicleId].status.idle -1,
            ordered: state[vehicleId].status.ordered + 1
          }
        })
      });

    case ActionTypes.RECIEVE_UPDATE_DATA: // 来自服务器的数据推送
      const {sensorId, status, statusMsg, prevStatusMsg} = action.data;
      var vehicleId = sensorId.split('_')[0];
      if (statusMsg == prevStatusMsg) { // 两次状态相同则不更新。
        return state;
      }
      return merge({}, state, {
        [vehicleId]: merge({}, state[vehicleId], {
          status:{
            [prevStatusMsg]: state[vehicleId].status[prevStatusMsg] - 1,
            [statusMsg]: state[vehicleId].status[statusMsg] + 1
          }
        })
      });

    default :
      return state;
  }
}

function sensors(state = initialState.sensors, action){
  switch(action.type){
    case ActionTypes.ORDERED_RECEIVE:
      var sensorId = action.sensorId;
      return merge({}, state, {
        [sensorId]: merge({}, state[sensorId], {
          currentStatus: 'ordered'
        })
      })

    case ActionTypes.RECIEVE_UPDATE_DATA:
      var {sensorId, status, statusMsg, prevStatusMsg} = action.data;
      return merge({}, state, {
        [sensorId]: merge({}, state[sensorId], {
          currentStatus: statusMsg
        })
      });

    default:
      return state;
  }
}

