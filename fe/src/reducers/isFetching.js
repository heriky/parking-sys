import * as ActionTypes from '../actions/index';


const initialState = {
  vehicleFetching: true,
  orderFetching: false
};
/**
MONITOR_REQUEST
MONITOR_SUCCESS
MONITOR_FAILURE
 */
function vehicleFetching(state = initialState.vehicleFetching, action){
  switch (action.type) {
    case ActionTypes.MONITOR_REQUEST:
      return true;
    case ActionTypes.MONITOR_SUCCESS:
    case ActionTypes.MONITOR_FAILURE:
      return false;
    default:
      return state;
  }
}

/* ORDERED_PATCH
ORDERED_RECEIVE
ORDERED_FAILURE */
function orderFetching(state = initialState.orderFetching, action){
  switch(action.type){
    case ActionTypes.ORDERED_PATCH:
      return true;
    case ActionTypes.ORDERED_RECEIVE:
    case ActionTypes.ORDERED_FAILURE:
      return false;
    default:
      return state;
  }
}

export default (state=initialState, action)=>({
  vehicleFetching: vehicleFetching(state.vehicleFetching, action),
  orderFetching: orderFetching(state.orderFetching, action)
})