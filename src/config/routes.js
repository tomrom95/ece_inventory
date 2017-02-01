import React from 'react';
import Inventory from '../components/Inventory.js';
import Home from '../components/Home.js';
import CurrentOrders from '../components/CurrentOrders.js';
import PastOrders from '../components/PastOrders.js';
import UserProfile from '../components/UserProfile.js';
import GlobalRequests from '../components/GlobalRequests.js';
import CreateUser from '../components/CreateUser.js';
import Transactions from '../components/Transactions.js';
import { Route, IndexRoute } from 'react-router';
import ItemDetailView from '../components/ItemDetailView.js';

export default (
  <Route>
    <Route path="/" component={Home}>
      <Route path="UserProfile" component={UserProfile}></Route>
      <Route path="Inventory" component={Inventory}></Route>
      <Route path="CurrentOrders" component={CurrentOrders}></Route>
      <Route path="GlobalRequests" component={GlobalRequests}></Route>
      <Route path="CreateUser" component={CreateUser}></Route>
      <Route path="Transactions" component={Transactions}></Route>
      <Route path="PastOrders" component={PastOrders}></Route>
      <Route path="Detail/:itemID" component={ItemDetailView} />
    </Route>
  </Route>
);
