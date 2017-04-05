import React,{PropTypes,Component} from 'react' ;
import {connect} from 'react-redux';

import {loadVehicles} from '../actions/index'

import '../components/Recommend/Recommend';
import './VehicleSelector';

class RecommendSelector extends Component{
  constructor(props) {
    super(props);
    this.state = {};
  }

  render(){
    return <div></div>
  }
}

