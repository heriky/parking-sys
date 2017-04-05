import React,{ PropTypes, Component } from 'react' ;

import styles from './Api.scss';

function Api(){
  return <div className={styles.root}>
    <table className={styles['api-table']}>
     <caption className={styles['api-title']}>标注api参考</caption>
      <thead>
        <tr>
          <th>编号</th>
          <th>api</th>
          <th>调用方</th>
          <th>功能</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>POST /api/v1/vehicles</td>
          <td>上位机</td>
          <td>初始化停车场数据</td>
        </tr>
        <tr>
          <td>2</td>
          <td>PUT /api/v1/vehicles</td>
          <td>上位机</td>
          <td>提交停车场数据变化</td>
        </tr>
        <tr>
          <td>3</td>
          <td>GET /api/v1/vehicle/:id</td>
          <td>客户端</td>
          <td>获取特定停车场的具体信息</td>
        </tr>
        <tr>
          <td>4</td>
          <td>GET /vehicle/order/:id</td>
          <td>客户端</td>
          <td>预定特定车位</td>
        </tr>
      </tbody>
    </table>
  </div>
}

export default Api;