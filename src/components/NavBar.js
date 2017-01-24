import React, { Component } from 'react';
import { RouteHandler, Link } from 'react-router';
import '../App.css';

class NavBar extends Component {
  render() {
    console.log("test NavBar");
    return (
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
                  <Link to="/CurrentOrders" className="nav-link">Current Orders</Link>
                </li>
                <li className="nav-item">
                  <Link to="/PastOrders" className="nav-link">Past Orders</Link>
                </li>
              </ul>
            </div>
          </nav>
    );
  }
}

export default NavBar;

