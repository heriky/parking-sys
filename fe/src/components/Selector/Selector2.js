import React,{PropTypes} from 'react' ;
import styles from './Selector.scss';
import {Link} from 'react-router' ;

function Selector({ids,names}){
  return (
    <ul className={styles["root"]}>
      {ids.map((id,index)=>
        <li className={styles["list-item"]} key={index}>
          <Link  to={`/monitor/${id}`} className={styles["item-name"]}>{names[index]}</Link>
          <span className={styles["item-status"]}>运行状态良好</span>
        </li>
      )}
    </ul>
  );
}

Selector.propTypes = {
  ids: PropTypes.array.isRequired,
  names: PropTypes.array.isRequired
}

export default Selector;