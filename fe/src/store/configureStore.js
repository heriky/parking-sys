import {applyMiddleware,createStore} from 'redux';
import thunk from 'redux-thunk'
import logger from 'redux-logger'
import {callAPIMiddleware} from '../middlewares/APIMiddleware' ;
import api from '../middlewares/api';
import rootReducer from '../reducers/index2'

export default (initialState)=>{
	return createStore(
		rootReducer,
		initialState,
		applyMiddleware(
			thunk,
      api,
			typeof window != 'undefined' ? logger() :({dispatch})=>next=>action=>{return next(action)}
	))
}