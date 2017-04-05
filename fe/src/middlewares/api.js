// [CALL_API]
// Schemas
// 网络请求，数据合并，数据归一化

import { Schema, normalize, arrayOf } from 'normalizr' ;
import fetch,{Headers} from 'isomorphic-fetch';
import url from 'url';
import {C} from '../env.config';

const API_ROOT = C.apiBase;

// 输出api标识
export const CALL_API = Symbol('call api');

// 输出标准化规则
const vehicleSchema = new Schema('vehicles', {idAttribute: 'id'});
const sensorSchema = new Schema('sensors', {idAttribute: 'id'});
vehicleSchema.define({
  sensors: arrayOf(sensorSchema)
});
export const Schemas = {
  VEHICLE: vehicleSchema,
  VEHICLE_ARRAY: arrayOf(vehicleSchema)
}

// 定义api中间件

export default store => next => action => {

  // 类型校验
  const callAPI = action[CALL_API];
  if (callAPI == null) {
    return next(action);
  }
  const {types, endpoint, method="GET", data, schema} = callAPI; //method默认值为GET

  // 类型验证
  if (!Array.isArray(types) || types.length != 3) {
    throw new Error('Expected an array of three action types');
  }
  if (!types.every(it=>typeof it ==='string')) {
    throw new Error('Expected action types to be strings.')
  }
  if (!typeof endpoint === 'string') {
    throw new Error('Expected the endpoint to be a string'); // 扩展，可以接受endpoint为函数
  }
  // if (!schema){
  //   throw new Error('Specify one of the exported Schemas.')
  // }

  // 逻辑处理
  function actionWith(data){
    const finalAction = Object.assign({}, action, data) ;
    delete finalAction[CALL_API];
    return finalAction
  }

  const [requestType, successType, failureType] = types;
  next(actionWith({ type: requestType }));
  callApi(endpoint, method, data, schema)
    .then(res=>next(actionWith({
      type: successType,
      res
    })))
    .catch(err=>next(actionWith({
      type: failureType,
      error: err || 'Something happened in the process of api request!'
    })))
}

// 请求处理过程, 使用同构fetch
function callApi(endpoint, method, data, schema){
  endpoint = endpoint.startsWith(API_ROOT) ? endpoint : url.resolve(API_ROOT, endpoint);
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods':'*'
  };
  const options = {
    method,
    mode: 'same-origin',
    cache: 'default',
    headers
  }
  if (data) { options.body = data };

  return fetch(endpoint, options)
    .then(res=>res.json().then(json=>({res, json})))
    .then(({res, json})=>{
      if (!res.ok || json.error) {
        return Promise.reject(json);
      }
      if (schema) {return normalize(json, schema);}
      return json;
    })
}