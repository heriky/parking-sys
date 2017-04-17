import React,{Component, PropTypes} from 'react';
import {connect} from 'react-redux'
import styles from './UserCenter.scss';
import { browserHistory } from 'react-router';
import fetch from 'isomorphic-fetch';
import {C} from '../../env.config';
import {fetchUserInfo} from '../../actions';

class UserCenter extends Component{
	constructor(props){
		super(props)
	}

	static needs = [
		fetchUserInfo
	]

	state = { completed: false }

	onPlanClick(lng, lat){
		browserHistory.push(`/path?lng=${lng}&lat=${lat}`)
	}

	onCancel(id){
		//   /vehicle/cancel/:id
		const cancelUrl =  C.apiBase + '/vehicle/cancel/'+id; // 这个id是停停车场和车位混合id
		fetch(cancelUrl, {
			method: 'GET',
			cache: 'default'
		})
		.then(res=>{
			if (res.ok) {
				return res.json()
			}else{
				console.log('取消车位预定错误，请仔细检查!')
				throw new Error('取消车位预定错误，请仔细检查!')
			}
		})
		.then(data=>{
			alert(data.result=='ok' ? data.msg : '取消车位错误');
			var user = JSON.parse(sessionStorage.getItem('_user')) ;
			user.ordered.vehicleId = null ;
			sessionStorage.setItem('_user', JSON.stringify(user));
			window.location.reload();
		})
		.catch(err=>{
			throw('取消车位时发生错误：', err);
		})
	}

	componentDidMount(){
		// 先从缓存中获取，若没有缓存才重新发送请求
		const cachedUser = sessionStorage.getItem('_user');
		if (cachedUser == null) {
			dispatch(fetchUserInfo(this.props.params.id));
			location.reload()
		}
	}

	onComplete(){
		this.setState((prevState, prevProps)=>{
			return Object.assign({}, prevState,{
				completed: true
			})
		})
	}

	render(){
		/**
		 * 	vehicleId: String,
		vehicleName: String,
		location: [String],
		sensorId: String
		 */
		// 推荐车位功能是从当前停车场中获取相似车位进行推荐
		const username = this.props.user.username;
		const userid = this.props.user._id;
		const {vehicleId, vehicleName, location, sensorId, loc} = this.props.user.ordered;
		// const ordered_sensor = this.props.sensors[vehicleId+'_'+sensorId];
		// if (ordered_sensor!= null && ordered_sensor[currentStatus] != 'ordered') {
		// 	alert('您预订的车位状态发生了变化，请重新选择预订！')
		// }
		debugger;
		return <div className={styles["container"]}>
			<h3 className={styles["user-flag"]}><u>{username}</u>的用户中心</h3>
			<div className={styles["user-orderd"]}>
				<h4>已预订车位</h4>
				<div className={styles["decor"]}></div>
				<ul className={styles["ordered-info"]}>
					<li>停车场地点: {location[2] || '未预定车位'}</li>
					<li>车位编号: {sensorId || '未预定车位'}</li>
					<li>车位当前状态: {vehicleName==null ? '未指定' : '已预订'}
					</li>
					<li>
						<button className={styles["order-op"]} onClick = {()=>this.onPlanClick(location[0], location[1])}>查看路径规划</button>
						<button className={styles["order-ensure"]}>√已预订</button>
						<button className={styles["order-op"]} onClick={()=>{this.onComplete()}} style={{background: 'rgb(0,255,0)',color:'black'}}>完成停车</button>
						<button className={styles["order-cancle"]}
						onClick={(e)=>{
							this.onCancel(vehicleId+'_'+sensorId+'_'+userid);}
						}
						disabled={sensorId==null ? true: false}
						style={{background: sensorId==null? '#ccc':'#f60', cursor: sensorId==null?'not-allowed':'pointer'}}
						>
							取消预定
						</button>
					</li>
				</ul>
				<form className={styles["rate-box"]} style={{display: this.state.completed? 'block':'none'}}>
					<legend>请对本次停车做出等级评价：</legend>
					<div className={styles["rate-item"]}>
						<span>此次停车是否花费了您大量时间？</span>
						<input name='rate1' type="radio" />1&nbsp;
						<input name='rate1' type="radio" />2&nbsp;
						<input name='rate1' type="radio" />3&nbsp;
						<input name='rate1' type="radio" />4&nbsp;
						<input name='rate1' type="radio" />5&nbsp;
					</div>
					<div className={styles["rate-item"]}>
						<span>当前车位的停车费用是否昂贵？</span>
						<input name='rate2' type="radio" />1&nbsp;
						<input name='rate2' type="radio" />2&nbsp;
						<input name='rate2' type="radio" />3&nbsp;
						<input name='rate2' type="radio" />4&nbsp;
						<input name='rate2' type="radio" />5&nbsp;
					</div>
					<div className={styles["rate-item"]}>
						<span>您觉得当前车位是否更安全？</span>
						<input name='rate3' type="radio" />1&nbsp;
						<input name='rate3' type="radio" />2&nbsp;
						<input name='rate3' type="radio" />3&nbsp;
						<input name='rate3' type="radio" />4&nbsp;
						<input name='rate3' type="radio" />5&nbsp;
					</div>
					<div className={styles["rate-item"]}>
						<span>当前车位距离出口位置是否较远?</span>
						<input name='rate4' type="radio" />1&nbsp;
						<input name='rate4' type="radio" />2&nbsp;
						<input name='rate4' type="radio" />3&nbsp;
						<input name='rate4' type="radio" />4&nbsp;
						<input name='rate4' type="radio" />5&nbsp;
					</div>
					<input type="submit" value='提交' className={styles["btn-rate"]} />
				</form>
			</div>

			<div className={styles["user-rec"]}>
				<h4 className={styles["rec-title"]}><span style={{color:"red"}}>{vehicleName}</span>相似停车位推荐</h4>
				<div className={styles["decor"]}></div>
				<section className={styles["card-container"]}>
				{new Array(6).fill(1).map((item, index)=>{
					return <ul key={index} className={styles["rec-card"]}>
						<li className={styles["card-item"]}>车位编号:{index}</li>
						<li className={styles["card-item"]}>车位状态:
							<i className={ index%2==0 ? styles["status-occupy"] : styles['status-idle']}>&nbsp;</i>占用
						</li>
						<li className={styles["card-item"]}>
							<button className={styles["btn"]}>预订</button>
						</li>
						<li className={styles["card-item"]} style={{marginTop: 8}}>
							<button className={styles["btn"]}>取消</button>
						</li>
					</ul>
				})}
				</section>
			</div>

			<div className={styles["around-park"]}>
				<h4>周边停车场</h4>
				<br/>
				<hr/>
				查询附近停车场<input type="number" placeholder='1'/><button className={styles['order-op']}>查询</button>
				<div className={styles["decor"]}></div>
				<table className={styles["around-table"]}>
					<caption>停车场推荐列表</caption>
					<tbody>
						<tr>
							<th>编号</th>
							<th>地点</th>
							<th>相距距离</th>
							<th>总车位数</th>
							<th>空闲位数</th>
							<th>操作</th>
						</tr>
						<tr>
							<td>#0</td>
							<td>陕西科技大学停车场</td>
							<td>3.6km</td>
							<td>总车位:100</td>
							<td>空闲车位:30</td>
							<td><button className={styles["btn"]}>查看</button></td>
						</tr>
						<tr>
							<td>#0</td>
							<td>陕西科技大学停车场</td>
							<td>3.6km</td>
							<td>总车位:100</td>
							<td>空闲车位:30</td>
							<td><button className={styles["btn"]}>查看</button></td>
						</tr>
						<tr>
							<td>#0</td>
							<td>陕西科技大学停车场</td>
							<td>3.6km</td>
							<td>总车位:100</td>
							<td>空闲车位:30</td>
							<td><button className={styles["btn"]}>查看</button></td>
						</tr>
						<tr>
							<td>#0</td>
							<td>陕西科技大学停车场</td>
							<td>3.6km</td>
							<td>总车位:100</td>
							<td>空闲车位:30</td>
							<td><button className={styles["btn"]}>查看</button></td>
						</tr>
					</tbody>
				</table>
			</div>

		</div>
	}
}

function mapStateToProps(state){
	const user = state.user;
	debugger;
	const sensors = state.entities.sensors;
	return {
		user,
		sensors
	}
}

export default connect(mapStateToProps)(UserCenter);