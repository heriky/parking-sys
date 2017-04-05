import React,{PropTypes, Component} from 'react' ;
import styles from './Path.scss';

import VehicleSelector from '../../containers/VehicleSelector';

class Path extends Component{
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount(){
    // 0. 进行当前位置的查询
    var location = localStorage.getItem('location') ;
    var locObj = location == null ? null : JSON.parse(location);
    var mapObj = location==null ? new AMap.Map('map') : new AMap.Map('map', {
      center: [locObj.lng, locObj.lat],
      zoom: 90
    });

    //1. 定位
    if (locObj != null) {
      // 2.规划路线
      // 获取当前位置和目标位置的经纬度
      var q = this.props.location.query;
      var destLoc = [q.lng, q.lat];
      var srcLoc = [locObj.lng, locObj.lat];
      plan(mapObj, srcLoc, destLoc)

      // 3. 标记
      mark(srcLoc)
    }else{
      loc(mapObj, (locObj)=>{
        // 2.规划路线
        // 获取当前位置和目标位置的经纬度
        var q = this.props.location.query;
        var destLoc = [q.lng, q.lat];
        var srcLoc = [locObj.lng, locObj.lat];
        plan(mapObj, srcLoc, destLoc)

        // 3. 标记
        mark(srcLoc)
      });
    }
  }

  render(){
    return <div className={styles.root}>
      <div><span id='currentLoc'>当前位置为:xxx, 从右侧选择临近停车场</span></div>
      <div id="map" className={styles.map}></div>
      <div className={styles.selector}>
        <VehicleSelector />
      </div>
      <div id="result" style={{height: 300, width: 300}}></div>
    </div>
  }
}

export default Path;

// 定位当前位置
function loc(mapObj, cb){
    mapObj.plugin('AMap.Geolocation', function () {
    var geolocation = new AMap.Geolocation({
      enableHighAccuracy: true,//是否使用高精度定位，默认:true
      timeout: 10000,          //超过10秒后停止定位，默认：无穷大
      maximumAge: 0,           //定位结果缓存0毫秒，默认：0
      convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
      showButton: true,        //显示定位按钮，默认：true
      buttonPosition: 'RB',    //定位按钮停靠位置，默认：'LB'，左下角
      buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
      showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
      showCircle: true,        //定位成功后用圆圈表示定位精度范围，默认：true
      panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
      zoomToAccuracy:true      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
    });
    mapObj.addControl(geolocation);
    AMap.event.addListener(geolocation, 'complete', rs=>{
      const {position, accuracy, isConverted, info} = rs;
      alert(info);
      // 存储入localstorage
      const currentLocation = position;
      localStorage.setItem('location', JSON.stringify(currentLocation));
      cb(currentLocation);
    });
    AMap.event.addListener(geolocation, 'error', err=>{
      alert(err.info)
    });
  });
}

// 路径规划，如果是从监控页面跳入，则会带来目标坐标地址，结合当前坐标地址，得到路径
// 如果是直接url跳转到来，则需要从右侧选择进入，以获取目的地的坐标

function plan(mapObj, src, dest){
  AMap.service('AMap.Driving',function(){//回调函数
     var driving = new AMap.Driving({
       map: mapObj,
       panel: "result"
     });

     driving.search(src, dest, function(status, result) {
        //TODO 解析返回结果，自己生成操作界面和地图展示界面
        alert(status)
    });
  });
}


// 从经纬度到地址， 并标记。
function mark(lnglatXY){
    AMap.service('AMap.Geocoder',function(){//回调函数
      var geocoder = new AMap.Geocoder({
          radius: 1000,
          extensions: "all"
      });
      geocoder.getAddress(lnglatXY, function(status, result) {
          if (status === 'complete' && result.info === 'OK') {
              geocoder_CallBack(result);
          }
      });
      var marker = new AMap.Marker({  //加点
          map: map,
          position: lnglatXY
      });
      map.setFitView();
    });
  }
  function geocoder_CallBack(data) {
      var address = data.regeocode.formattedAddress; //返回地址描述
      document.getElementById("currentLoc").innerHTML = `您当前位置为:<br/><font color='red'>${address}</font><br/>从右侧选择临近停车场`;
  }
