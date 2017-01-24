import React from 'react';
import Inventory from '../components/Inventory.js';
import Home from '../components/Home.js';
import { Route, IndexRoute } from 'react-router';

export default (
  <Route>
    <Route path="/" component={Home}></Route>
    <Route path="/Inventory" component={Inventory}></Route>
  </Route>
);
