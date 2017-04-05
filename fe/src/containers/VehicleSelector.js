import React,{PropTypes,Component} from 'react' ;
import {connect} from 'react-redux';

import {loadVehicles} from '../actions/index'

import Selector from '../components/Selector/Selector2';

class VehicleSelector extends Component{
  constructor(props){
    super(props) ;
  }

  static needs = [
    loadVehicles
  ]

  componentDidMount = ()=>{
    const dispatch = this.props.dispatch ;
    dispatch(loadVehicles()) ;
  }

  render(){
    const { ids, names } = this.props;
    return (
      <Selector ids={ids} names = {names} />
    )
  }
}

export default connect(mapStateToProps)(VehicleSelector);

function mapStateToProps(state, ownProps){
  const ids = state.vehicles.ids;
  const vehiclesTable = state.entities.vehicles;
  const names = ids.map(id=>vehiclesTable[id].name);
  return {
    ids,
    names
  }
}