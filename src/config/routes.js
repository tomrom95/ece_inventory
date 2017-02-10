import React, {Component} from 'react';
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

class InventoryWrapper extends Component {
    render() {
        return <Inventory api={"something"}/>;
    }
}

class HomeWrapper extends Component {
    render() {
        return <Home api={"something"}/>;
    }
}

class CurrentOrdersWrapper extends Component {
    render() {
        return <CurrentOrders api={"something"}/>;
    }
}

class PastOrdersWrapper extends Component {
    render() {
        return <PastOrders api={"something"}/>;
    }
}

class UserProfileWrapper extends Component {
    render() {
        return <UserProfile api={"something"}/>;
    }
}

class GlobalRequestsWrapper extends Component {
    render() {
        return <GlobalRequests api={"something"}/>;
    }
}

class CreateUserWrapper extends Component {
    render() {
        return <CreateUser api={"something"}/>;
    }
}

class TransactionsWrapper extends Component {
    render() {
        return <Transactions api={"something"}/>;
    }
}

class ItemDetailViewWrapper extends Component {
    render() {
        return <ItemDetailView api={"something"}/>;
    }
}


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
