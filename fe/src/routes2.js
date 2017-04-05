import React from 'react'
import {Route,IndexRoute} from 'react-router' ;
import App from './components/App/App'
import Home from  './components/Home/Home'
import Monitor2 from './containers/Monitor2' ;
import VehicleSelector from './containers/VehicleSelector';
import Path from './components/Path/Path';
import Api from './components/Api/Api';
import UserCenter from './components/UserCenter';

export default (
  <Route path='/' component = {App}>
    <IndexRoute component={Home}/>
    <Route path = 'monitor' component = {VehicleSelector}  />
    <Route path = 'monitor/:id' component = {Monitor2} />
    <Route path= 'uc/:id' component = {UserCenter}/>
    <Route path = 'path' component= {Path} />
    <Route path= 'api' component = {Api}/>
  </Route>
)