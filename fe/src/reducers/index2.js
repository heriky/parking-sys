import { combineReducers } from 'redux';

import * as ActionTypes from '../actions/index';

import vehicles from './vehicles';
import entities from './entities';
import isFetching from './isFetching';
import user from './user';

// 全局错误处理
function errorMessage(state=null, action){
  if (action.error) {
    return action.error;
  }
  return state;
}


export default combineReducers({
  vehicles,
  entities,
  isFetching,
  errorMessage,
  user
})
