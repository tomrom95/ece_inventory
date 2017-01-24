import React, { Component } from 'react';
import './App.css';
import UserProfile from './components/UserProfile';
import Inventory from './components/Inventory';
import { Link } from 'react-router';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>ECE Laboratory</h2>
        </div>
        <p className="App-intro">
          login
        </p>
	<a className="navbar-brand" href="/components/Inventory"">inventory</a>
	<div className="collapse navbar-toggleable-md" id="navbarResponsive">
          <ul className="nav navbar-nav">
            <li className="nav-item">
              <Link to="/components/Inventory" className="nav-link">Inventory</Link>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default App;

