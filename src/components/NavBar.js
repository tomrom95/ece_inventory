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
        <nav className="navbar fixed-top navbar-toggleable-md navbar-light bg-faded">
          <button className="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <a className="navbar-brand" href="#">ECE Inventory</a>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav mr-auto">
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
              <li className="nav-item btn-nav">
                <button className="btn btn-outline-primary" onClick={this.props.onClick}>
                  Sign Out
                </button>
              </li>
            </ul>
          </div>
        </nav>
      );

    }
    else{
      return (
        <nav className="navbar fixed-top navbar-toggleable-md navbar-light bg-faded">
          <button className="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <a className="navbar-brand" href="#">ECE Inventory</a>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav mr-auto">
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
              <li className="nav-item btn-nav">
                <button className="btn btn-outline-primary" onClick={this.props.onClick}>
                  Sign Out
                </button>
              </li>
            </ul>
          </div>
        </nav>
    );

    }
  }
}

export default NavBar;
