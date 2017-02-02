import React, { Component } from 'react';
import { RouteHandler, Link } from 'react-router';
import '../App.css';

class NavBar extends Component {
  constructor(props){
    super(props);
  }
  render() {
    if(this.props.isAdmin){
      console.log("test NavBar");

      return (
        <nav className="navbar navbar-light bg-faded navbar-fixed-top">
            <div className="navbar-toggleable-md" id="navbarResponsive">

              <ul className="nav navbar-nav">
                <a className="App-header" href="">ECE Laboratory</a>
                <li className="nav-item">
                  <Link to="/" className="nav-link">Home</Link>
                </li>
                <li className="nav-item">
                  <Link to="/UserProfile" className="nav-link">Profile</Link>
                </li>
                <li className="nav-item">
                  <Link to="/Inventory" className="nav-link">Inventory</Link>
                </li>
                <li className="nav-item">
                  <Link to="/GlobalRequests" className="nav-link">User Requests</Link>
                </li>
                <li className="nav-item">
                  <Link to="/CreateUser" className="nav-link">Create User</Link>
                </li>
                <li className="nav-item">
                  <Link to="/Transactions" className="nav-link">Transactions</Link>
                </li>
                <li className="nav-item">
                <button className="btn btn-primary" onClick={this.props.onClick}>
                  sign out
                </button>
                </li>
              </ul>
            </div>
          </nav>
      );

    }
    else{
      return (
        <nav className="navbar navbar-light bg-faded navbar-fixed-top">
            <div className="collapse navbar-toggleable-md" id="navbarResponsive">
              <a className="App-header" href="#">ECE Laboratory</a>
              <ul className="nav navbar-nav">
                <li className="nav-item">
                  <Link to="/" className="nav-link">Home</Link>
                </li>
                <li className="nav-item">
                  <Link to="/UserProfile" className="nav-link">Profile</Link>
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
}

export default NavBar;
