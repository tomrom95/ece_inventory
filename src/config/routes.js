import React, {Component} from 'react';
import Inventory from '../components/inventory/Inventory.js';
import Home from '../components/home/Home.js';
import CurrentOrders from '../components/requests/CurrentOrders.js';
import UserProfile from '../components/user/UserProfile.js';
import GlobalRequests from '../components/requests/GlobalRequests.js';
import UsersTab from '../components/user/UsersTab.js';
import DocsView from '../components/docs/DocsView.js';
import Transactions from '../components/transactions/Transactions.js';
import LogPage from '../components/logging/LogPage.js';
import LoanPage from '../components/loans/LoanPage.js';
import MyLoansPage from '../components/loans/MyLoansPage.js';
import {Route, IndexRoute} from 'react-router';
import LoanEmailReminders from '../components/emailing/LoanEmailReminders.js';

class UserProfileWrapper extends Component {
    render() {
        return (<UserProfile {...this.props} showDetailedPage ={true} />);
    }
}

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


class LogPageWrapper extends Component {
  render() {
    return (<LogPage showFilterBox={true} showButtons={true} id="log-page" />);
  }
}

class LoanPageWrapper extends Component {
    render() {
        return (<LoanPage isGlobal={true} showFilterBox={true} />);
    }
}

class LoanEmailRemindersWrapper extends Component {
  render() {
    return (<LoanEmailReminders/>);
  }
}


export default (
  <Route path="/" component={Home}>
    <IndexRoute component={InventoryWrapper}/>
    <Route path="UserProfile" component={UserProfileWrapper}></Route>
    <Route path="Inventory" component={InventoryWrapper}></Route>
    <Route path="CurrentOrders" component={CurrentOrdersWrapper}></Route>
    <Route path="GlobalRequests" component={GlobalRequestsWrapper}></Route>
    <Route path="Loans" component={LoanPageWrapper}></Route>
    <Route path="MyLoans" component={MyLoansPage}></Route>
    <Route path="Users" component={UsersTab}></Route>
    <Route path="Docs" component={DocsWrapper}></Route>
    <Route path="Transactions" component={TransactionsWrapper}></Route>
    <Route path="Log" component={LogPageWrapper}></Route>
    <Route path="LoanEmailReminders" component={LoanEmailRemindersWrapper}></Route>
  </Route>
);
