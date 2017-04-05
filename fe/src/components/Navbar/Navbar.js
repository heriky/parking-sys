import React,{propTypes} from 'react' ;
import NavbarBrand from './NavbarBrand';
import NavbarMenu from './NavbarMenu';
import NavbarExtra from './NavbarExtra';
import styles from './Navbar.scss' ;
import classNames from 'classname' ;

const Navbar = (props)=>(
	<nav className ={styles.root}>
		<NavbarBrand />
		<NavbarMenu loc = {props.loc}/>
		<NavbarExtra />
	</nav>
)

export default Navbar ;