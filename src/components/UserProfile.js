import React, { Component } from 'react';
import { RouteHandler, Link } from 'react-router';
import NavBar from './NavBar.js';
import '../App.css';

class UserProfile extends Component {
  constructor(props){
    super(props);
  }
  render() {
    console.log(this.props.username);
    var status = '';
    if(this.props.isAdmin){
      status = 'is admin';
    }
    else{
      status = 'is not admin';
    }
    return (
      <div className="App-Header">
        <p className="App-Header">Username: {this.props.username}</p>
        <p className="App-Header">Admin Status: {status}</p>
      </div>
    );
  }
}

export default UserProfile;
