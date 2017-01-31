import React, { Component } from 'react';
import { RouteHandler, Link } from 'react-router';
import NavBar from './NavBar.js';
import '../App.css';

class UserProfile extends Component {
  constructor(props){
    super(props);
  }
  render() {
    return (
      <div className="App">
        <p className="App-Header">User Info</p>
      </div>
    );
  }
}

export default UserProfile;
