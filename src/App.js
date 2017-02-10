import React, { Component } from 'react';
import { Router, browserHistory } from 'react-router';
import routes from './config/routes';
import querystring from 'querystring';
import axios from 'axios';

function checkForOAuth(nextState, replace) {
  if (nextState.location.hash) {
    var token = querystring.parse(nextState.location.hash).access_token;
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

class App extends Component {
  render() {
    return (
      <Router history={browserHistory} onEnter={checkForOAuth}>{routes}</Router>
    );
  }
}
export default App;
