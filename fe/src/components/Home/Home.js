import React,{propTypes} from 'react' ;
import ProgressBar from  '../common/ProgressBar/ProgressBar'
import styles from './Home.scss'

const Home = (props)=>(
	<div className={styles["container"]}>
	    <div className={styles["sys-desc"]}>
	        <h2 className={styles["desc-title"]}><i className='iconfont' style={{font:21}}>&#xe601;</i>系统描述</h2>
	        <p className={styles["desc-content"]}>
	            随着国民经济不断发展，人民生活品质日益提高，城市汽车保有量大幅增加，停车难成为人们工作生活中的一大难题，由此造成了交通堵塞、环境污染、资源浪费等问题。本研究根据当前停车系统现状，设计了一种基于ZigBee无线传感网络的智能停车系统，通过线上线下互动管理停车位，提高了车位的利用率，有效缓解了城市停车混乱的问题。
	        </p>
	    </div>
	    <div className={styles["func-desc"]}>
	        <h2 className={styles["desc-title"]}><i className='iconfont' style={{font:21}}>&#xe601;</i>功能描述</h2>
	        <div className={styles["desc-content"]}>
	            经过对“滴滴打车”运作模式进行研究，基于O2O理念，结合传感网络、物联网和互联网技术，研究探讨停车智能管理的解决方案，旨在缓解停车场信息共享困难，减少用户寻找停车位的成本，提高停车管理的智能化和自动化程度。针对传统停车场所面临的困境，本系统提供了如下功能：
	            <ul>
	                <li style={{fontWeight: 700, textDecoration: 700}}>1. 在线查看停车场中车位状态功能。减轻用户对停车形势的盲目性，为用户提供实时性的停车信息。</li>
	                <li style={{fontWeight: 700, textDecoration: 700}}>2. 停车场信息共享功能。各个停车场之间信息共享，减少“信息孤岛”带来的负面影响。</li>
	                <li style={{fontWeight: 700, textDecoration: 700}}>3. 在线车位预定功能。用户可以对空闲状态的车位进行标记，实现简单的预定功能。</li>
	                <li style={{fontWeight: 700, textDecoration: 700}}>4. 停车位推荐和停车场推荐。针对预定功能的缺陷，系统采用推荐算法进行车位推荐，采用地理位置索引搜索周边停车场。</li>
	            </ul>
	        </div>
	    </div>
	    <div className={styles["op-desc"]}>
	        <h2 className={styles["desc-title"]}><i className='iconfont' style={{font:21}}>&#xe601;</i>使用方法</h2>
	        <div className={styles["desc-content"]}>
	            使用本系统进行智能停车。
	            <p> 通过点击导航栏上的“监控”，可以查看本系统中收录的所有停车场列表，列表中展示了当前停车场的名称和状态，通过点击相应名称，可以进一步查看停车场的具体车位信息。具体信息包括: 总车位数、空闲车位数、已占用车位数和已预约车位数。</p>
	            <p> 在系统中可以对停车场大致信息进行概览，如果想进一步使用预约车位、停车路径规划等功能，必须先进行用户注册和登录。已登录的用户可以通过点击页面中绿色方块进行车位的预约，每个用户只可以预约一个车位，已经预约车位的用户可通过点击页面底部的“查看路线”按钮来获取停车路径的规划。</p>
	            <p>已登录的用户可以通过点击页面右上角的用户头像进入“用户中心”。用户中心记录了用户在本系统中的所有操作，用户可以在此处查看已预订的车位、取消已预约的车位、查看针对当前已预约车位的推荐车位、查看当前停车场周边的停车场。</p>
	            <p> 至此，用户通过本系统详细了解了目标停车场的车位状态信息，并通过“预约”功能对车位实现了软标记，即使软标记的车位被强制占用，用户也可以通过推荐功能获得新的停车位信息，系统还为用户提供了停车路径规划等功能，进一步提高了停车效率，缓解人们日常停车难问题，对促进城市交通进步有一定的积极意义。
	            </p>
	        </div>
	    </div>
	</div>
)

export default Home ;