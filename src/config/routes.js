import React from 'react';
import Inventory from '../components/inventory/Inventory.js';
import Home from '../components/home/Home.js';
import CurrentOrders from '../components/requests/CurrentOrders.js';
import PastOrders from '../components/requests/PastOrders.js';
import UserProfile from '../components/user/UserProfile.js';
import GlobalRequests from '../components/requests/GlobalRequests.js';
import CreateUser from '../components/user/CreateUser.js';
import Transactions from '../components/transactions/Transactions.js';
import ItemDetailView from '../components/inventory/ItemDetailView.js';
import { Route} from 'react-router';


export default (
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
);
