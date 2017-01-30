import React from 'react';
import Inventory from '../components/Inventory.js';
import Home from '../components/Home.js';
import CurrentOrders from '../components/CurrentOrders.js';
import PastOrders from '../components/PastOrders.js';
import UserProfile from '../components/UserProfile.js';
import { Route, IndexRoute } from 'react-router';

export default (
  <Route>
    <Route path="/" component={Home}></Route>
    <Route path="/UserProfile" component={UserProfile}></Route>
    <Route path="/Inventory" component={Inventory}></Route>
    <Route path="/CurrentOrders" component={CurrentOrders}></Route>
    <Route path="/PastOrders" component={PastOrders}></Route>
  </Route>
);

