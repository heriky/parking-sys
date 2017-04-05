import React,{propTypes, Component} from 'react' ;
import styles from './NavbarExtra.scss';
import Modal from '../Modal/Modal';

class NavbarExtra extends Component{
	constructor(props){
		super(props);
		this.handleLogin = this.handleLogin.bind(this);
		this.handleReg = this.handleReg.bind(this);
	}

	state={
		isShow: false,
		btnState: null,
		isLogged: false // 标志用户登录状态
	};

	componentDidMount(){
		let loggedUser = sessionStorage.getItem('_user');
		try{
			loggedUser = JSON.parse(loggedUser);
			if (loggedUser != null) {
				this._user = loggedUser;
				this.setState((prevProps, prevState)=>{
					return Object.assign({}, prevState, {
						isLogged: true
					})
				})
			}
		}catch(err){
			console.log('未登录的用户')
		}
	}

	handleLogin(){
		this.setState((prevProps, prevState)=>{
			return Object.assign({}, prevState, {isShow: true, btnState: 'login'})
		})
	}

	handleReg(){
		this.setState((prevProps, prevState)=>{
			return Object.assign({}, prevState, {isShow: true, btnState: 'reg'})
		})
	}

	changeModalVisible(isShow){
		this.setState({isShow});
	}

	render(){
		return <div className={styles.root}>
			<div style={{display: this.state.isLogged ? 'none':'inline-block' }}>
				<a href="#" className={styles['user-btn']} onClick={this.handleLogin}>登录</a>
				<a href="#" className={styles['user-btn']} onClick={this.handleReg}>注册</a>
			</div>
			<div style={{display: this.state.isLogged ? 'inline-block':'none'}} className = {styles.logged}>
				<a href={`/uc/${this._user&&this._user._id}`}>
					<img src="https://avatars0.githubusercontent.com/u/12195736?v=3&s=40" title={this._user && this._user.username}/>
				</a>
			</div>
			<Modal {...this.state} changeModalVisible={(isShow)=>{this.changeModalVisible(isShow)}}
				handleReg={this.handleReg} handleLogin={this.handleLogin}
			/>
		</div>
	}
}

export default NavbarExtra ;