import React, { Component } from 'react';
import { RouteHandler, Link } from 'react-router';
import NavBar from './NavBar.js';
import '../App.css';

class UserProfile extends Component {
  render() {
    console.log("test Home");
    return (
      <div className="App">
        <NavBar />
        <p className="App-Intro">Some bull shit</p>
      </div>
    );
  }
}

export default UserProfile;

