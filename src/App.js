import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Route, Router, browserHistory } from 'react-router';
import routes from './config/routes';
import Home from './components/Home';

class App extends Component {
  render() {
    console.log("test App");
    return (
      <Router history = {browserHistory}>{routes}</Router>
    );
  }
}
export default App;
