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

	componentDidMount(){
		// 先从缓存中获取，若没有缓存才重新发送请求
		const cachedUser = sessionStorage.getItem('_user');
		if (cachedUser == null) {
			dispatch(fetchUserInfo(this.props.params.id));
		}
	}

	render(){
		/**
		 * 	vehicleId: String,
		vehicleName: String,
		location: [String],
		sensorId: String
		 */
		debugger;
		const {vehicleId, vehicleName, location, sensorId, username, loc} = this.props.user.ordered;
		return <div className={styles["container"]}>
			<h3 className={styles["user-flag"]}><u>{username}</u>的用户中心</h3>
			<div className={styles["user-orderd"]}>
				<h4>已预订车位</h4>
				<div className={styles["decor"]}></div>
				<ul className={styles["ordered-info"]}>
					<li>停车场地点: {location[3]}</li>
					<li>车位编号: #{sensorId}</li>
					<li>车位当前状态: 占用</li>
					<li>查看路径规划</li>
					<li>
						<button className={styles["order-op"]}>预订</button>
						<button className={styles["order-ensure"]}>√已预订</button>
						<button className={styles["order-cancle"]}>取消</button>
					</li>
				</ul>
			</div>

			<div className={styles["user-rec"]}>
				<h4 className={styles["rec-title"]}>xxxx停车场相似车位推荐</h4>
				<div className={styles["decor"]}></div>
				<section className={styles["card-container"]}>
					<ul className={styles["rec-card"]}>
						<li className={styles["card-item"]}>车位编号</li>
						<li className={styles["card-item"]}>车位状态: <i className={styles["status-occupy"]}>&nbsp;</i>占用</li>
						<li className={styles["card-item"]}>
							<button className={styles["btn"]}>预订</button>
						</li>
						<li className={styles["card-item"]} style={{marginTop: 8}}>
							<button className={styles["btn"]}>取消</button>
						</li>
					</ul>
				</section>
			</div>

			<div className={styles["around-park"]}>
				<h4>周边停车场</h4>
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
							<td>西安工业大学</td>
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
	return {user}
}

export default connect(mapStateToProps)(UserCenter);