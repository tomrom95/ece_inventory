import React from 'react';
import Inventory from '../components/Inventory.js';
import Home from '../components/Home.js';
import CurrentOrders from '../components/CurrentOrders.js';
import PastOrders from '../components/PastOrders.js';
import UserProfile from '../components/UserProfile.js';
import GlobalRequests from '../components/GlobalRequests.js';
import CreateUser from '../components/CreateUser.js';
import Transactions from '../components/Transactions.js';
import { Route} from 'react-router';
import ItemDetailView from '../components/ItemDetailView.js';

import querystring from 'querystring';
import axios from 'axios';

function checkForOAuth(nextState, replace) {
  if (nextState.location.hash) {
    var token = querystring.parse(nextState.location.hash.slice(1)).access_token;
    axios.post('https://' + location.hostname + ':3001/auth/login', {
      token: token
    }).then(function(result) {
      if (result.error) {
        console.log(result.error)
      } else {
        console.log("SETTING TOKEN!!");
        localStorage.setItem('user', JSON.stringify(result.data.user));
        localStorage.setItem('token', result.data.token);
      }
      location.hash = '';
      replace('/');
    }).catch(function(error) {
      console.log(error);
      location.hash = '';
      replace('/');
    });
  }
}

export default (
  <Route path="/" component={Home} onEnter={checkForOAuth}>
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
