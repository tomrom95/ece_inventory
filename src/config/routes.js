import React, {Component} from 'react';
import Inventory from '../components/inventory/Inventory.js';
import Home from '../components/home/Home.js';
import CurrentOrders from '../components/requests/CurrentOrders.js';
import UserProfile from '../components/user/UserProfile.js';
import GlobalRequests from '../components/requests/GlobalRequests.js';
import CreateUser from '../components/user/CreateUser.js';
import EditUsers from '../components/user/EditUsers.js';
import DocsView from '../components/docs/DocsView.js';
import Transactions from '../components/transactions/Transactions.js';
import LogTable from '../components/logging/LogTable.js';
import LogPage from '../components/logging/LogPage.js';
import { Route} from 'react-router';
import querystring from 'querystring';
import axios from 'axios';

class InventoryWrapper extends Component {
    render() {
        return <Inventory api={"something"}/>;
    }
}


class CurrentOrdersWrapper extends Component {
    render() {
        return <CurrentOrders
        showFilterBox={false}
        showStatusFilterBox={true}
        hasOtherParams={false}
        api={"something"}/>;
    }
}

class GlobalRequestsWrapper extends Component {
    render() {
        return <GlobalRequests
        showFilterBox={false}
        showStatusFilterBox={true}
        hasOtherParams={false}
        api={"something"}/>;
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

class DocsWrapper extends Component {
  render() {
    return <DocsView/>
  }
}

class LogTableWrapper extends Component {
    render() {
        return (<LogTable showButtons={true} showFilterBox={true} />);
    }
}

class LogPageWrapper extends Component {
    render() {
        return (<LogPage showFilterBox={true} showButtons={true} id="log-page" />);
    }
}

export default (
  <Route path="/" component={Home}>
    <Route path="UserProfile" component={UserProfile}></Route>
    <Route path="Inventory" component={InventoryWrapper}></Route>
    <Route path="CurrentOrders" component={CurrentOrdersWrapper}></Route>
    <Route path="GlobalRequests" component={GlobalRequestsWrapper}></Route>
    <Route path="CreateUser" component={CreateUserWrapper}></Route>
    <Route path="EditUsers" component={EditUsers}></Route>
    <Route path="Docs" component={DocsWrapper}></Route>
    <Route path="Transactions" component={TransactionsWrapper}></Route>
    <Route path="Log" component={LogPageWrapper}></Route>
  </Route>
);
