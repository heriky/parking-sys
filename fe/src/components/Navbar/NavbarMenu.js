import React,{propTypes, Component} from 'react' ;
import NavLink from '../NavLink' ;
import NavbarExtra from './NavbarExtra';

import styles from './NavbarMenu.scss' ;
import classNames from  'classnames' ;

class NavbarMenu extends Component{
	constructor(props){
		super(props);
		this.toggleNav = this.toggleNav.bind(this);
	}

	state={
		expand: false // 子菜单是否展开
	}

	toggleNav(){
		this.setState({expand: !this.state.expand})
	}

	render(){
		const loc = this.props.loc;
		const path = loc.pathname;
		return <div>
		<div className = {styles.toggle} onClick={this.toggleNav}>|||</div>
		<ul className={styles.root} >
			<li className={styles['menu-item']} key="1" data-role = 'navlink'><NavLink to='/' isIndex={true} isActive = {path==='/'}><i className='iconfont'>&#xe604;</i>&nbsp;首页</NavLink></li>
			<li className={styles['menu-item']} key="2" data-role = 'navlink'><NavLink to='/monitor' isActive={path.startsWith('/monitor')}><i className='iconfont'>&#xe603;</i>&nbsp;监控</NavLink></li>
			<li className={styles['menu-item']} key="4" data-role = 'navlink'><NavLink to='/api'><i className='iconfont'>&#xe600;</i>&nbsp;API</NavLink></li>
			<li className={styles['menu-item']} key="5" data-role = 'navlink'><NavLink to='/feedback'><i className='iconfont'>&#xe602;</i>&nbsp;反馈</NavLink></li>
		</ul>
		<ul className={styles['root-little']}  style={{display: this.state.expand? 'block':'none'}}>
			<li onClick = {this.toggleNav} className={styles['menu-item']} key="1" data-role = 'navlink'><NavLink to='/' isIndex={true} isActive = {path==='/'}><i className='iconfont'>&#xe604;</i>&nbsp;首页</NavLink></li>
			<li onClick = {this.toggleNav} className={styles['menu-item']} key="2" data-role = 'navlink'><NavLink to='/monitor' isActive={path.startsWith('/monitor')}><i className='iconfont'>&#xe603;</i>&nbsp;监控</NavLink></li>
			<li onClick = {this.toggleNav} className={styles['menu-item']} key="4" data-role = 'navlink'><NavLink to='/api'><i className='iconfont'>&#xe600;</i>&nbsp;API</NavLink></li>
			<li onClick = {this.toggleNav} className={styles['menu-item']} key="5" data-role = 'navlink'><NavLink to='/feedback'><i className='iconfont'>&#xe602;</i>&nbsp;反馈</NavLink></li>
		</ul>
		</div>
	}
}


export default NavbarMenu ;