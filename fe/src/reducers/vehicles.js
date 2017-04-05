import {union, merge} from 'lodash';

import * as ActionTypes from '../actions/index'
//VEHICLES_REQUEST
//VEHICLES_SUCCESS
//VEHICLES_FAILURE

const initialState = {ids:[], isFetching: false}

function vehicles(state = initialState, action){
  switch (action.type) {
    case ActionTypes.VEHICLES_REQUEST :
      return merge({}, state, {
        fetching: true
      })

    case ActionTypes.VEHICLES_SUCCESS :
      return merge({}, state, {
        fetching: false,
        ids: union(state.ids, action.res.result)
      })

    case ActionTypes.VEHICLES_FAILURE :
      return merge({}, state, {
        fetching : false
      })

    default:
      return state;
  }
}

export default vehicles;