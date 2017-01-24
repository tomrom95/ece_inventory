import React, { Component } from 'react';
import { RouteHandler, Link } from 'react-router';
import '../App.css';

class Home extends Component {
  render() {
    console.log("test Home");
    return (
      <div className="App">
        <nav className="navbar navbar-light bg-faded navbar-fixed-top">
            <div className="collapse navbar-toggleable-md" id="navbarResponsive">
              <a className="App-header" href="">ECE Laboratory</a>
              <ul className="nav navbar-nav">
                <li className="nav-item">
                  <Link to="/" className="nav-link">Profile</Link>
                </li>
                <li className="nav-item">
                  <Link to="/Inventory" className="nav-link">Inventory</Link>
                </li>
                <li className="nav-item">
                  <Link to="/ProfileHistory" className="nav-link">Past Orders</Link>
                </li>
              </ul>
            </div>
          </nav>
      </div>
    );
  }
}

export default Home;
