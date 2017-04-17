import React, {PropTypes, Component} from 'react';
import styles from './Modal.scss';
import fetch from 'isomorphic-fetch'
import {C} from '../../env.config'

class Modal extends Component{
	constructor(prop){
		super(prop);
		this.login = this.login.bind(this)
		this.reg = this.reg.bind(this)
	}

	login(username, password){
		if (username == null || password == null) { return false;}
		const url = C.apiBase +'/login'
		fetch(url, {
			method: 'post',
	    cache: 'default',
	     headers:{
	    	'Content-Type': 'application/json'
	    },
	    body: JSON.stringify({username, password})
		}).then(res=>res.json()).then(data=>{
			if (data.result == 'ok') {
				// 写入sessionStorage,保持登录
				alert('登入成功')
				sessionStorage.setItem('_user', JSON.stringify(data.user));
				location.reload(); // 登录成功后刷新页面
			}else{
				alert('登入失败')
			}
		})
	}

	reg(username, password){
		if (username == null || password == null) { return false;}
		const url = C.apiBase +'/reg'
		fetch(url, {
			method: 'post',
	    cache: 'default',
	    headers:{
	    	'Content-Type': 'application/json'
	    },
	    body: JSON.stringify({username, password})
		}).then(res=>res.text()).then(rs=>{
			alert('注册成功');
			window.loaction.reload();
		})
	}

	render(){
		let {isShow, btnState, changeModalVisible,handleReg, handleLogin} = this.props;
		let username_login ;
		let pwd_login ;
		let username_reg ;
		let pwd_reg ;


		let loginBtn, regBtn;
		if (loginBtn && btnState=='login') { loginBtn.focus(); }
		if (regBtn && btnState == 'reg') { regBtn.focus(); }

		return <div
			className={styles['root']}
			style={{display: isShow?'block':'none'}}
			onClick = {e=>{changeModalVisible(false)}}>
		<div className={styles["modal"]} onClick={(e)=>{ e.stopPropagation()}}>
				<h4 className={styles["modal-desc"]}>智能停车系统登入系统</h4>
				<div className={styles["modal-title"]}>
				    <a href="#" className={styles["login-title"]} ref={node=>{loginBtn = node}} onClick={handleLogin}>登录</a>
				    <a href="#" className={styles["reg-title"]}  ref={node=>{regBtn=node}} onClick={handleReg}>注册</a>
				</div>
				<div className={styles["modal-body"]}>
				    <form className={styles["login-body"]} style={{display: btnState=='login'?'block':'none'}}
							onSubmit={() => this.login(username_login.value, pwd_login.value)}
				    >
				    	<input required autoComplete type="text" ref={node=>username_login = node}  placeholder="登录用户名"/>
				    	<input required autoComplete type="password" ref={node=>pwd_login = node} placeholder="密码"/>
				    	<input type='submit' value='登录'/>
				    </form>
				    <form className={styles["reg-body"]} style={{display: btnState=='reg'?'block':'none'}}
							onSubmit = {() =>this.reg(username_reg.value, pwd_reg.value)}
				    >
				    	<input required autoComplete type="text"  ref={node=>username_reg = node} placeholder="注册用户名" />
				    	<input required autoComplete type="password" ref={node=>pwd_reg = node} placeholder="密码" />
				    	<input required autoComplete type="password" ref={node=>pwd_reg = node} placeholder="重复密码" />
				    	<input type='submit' value='注册' />
				    </form>
				</div>
		</div>
		</div>
	}
}

export default Modal;