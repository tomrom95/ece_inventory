import React, { Component } from 'react';
import { Link } from 'react-router';
import '../../App.css';

class NavBar extends Component {
  constructor(props){
    super(props);
  }
  render() {
    if(this.props.role === "ADMIN" || this.props.role === "MANAGER"){
      return (
        <nav className="navbar fixed-top navbar-toggleable-md navbar-light bg-faded">
          <button className="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <a className="navbar-brand" href="#">ECE INVENTORY</a>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item">
                <Link to="/UserProfile" className="nav-link">PROFILE</Link>
              </li>
              <li className="nav-item">
                <Link to="/Inventory" className="nav-link">INVENTORY</Link>
              </li>
              <li className="nav-item">
                <Link to="/GlobalRequests" className="nav-link">USER REQUESTS</Link>
              </li>
              <li className="nav-item">
                <Link to="/CurrentOrders" className="nav-link">MY REQUESTS</Link>
              </li>
              <li className="nav-item">
                <Link to="/Log" className="nav-link">LOG</Link>
              </li>
              <li className="nav-item">
                <Link to="/CreateUser" className="nav-link">CREATE USER</Link>
              </li>
              <li className="nav-item">
                <Link to="/EditUsers" className="nav-link">EDIT USERS</Link>
              </li>
              <li className="nav-item">
                <Link to="/Docs" className="nav-link">DOCS</Link>
              </li>
              <div className="navbar-right-panel">
              <li className="nav-item welcome-message">
              Welcome back, {this.props.first_name ? this.props.first_name: this.props.username}.
              </li>
              <li className="nav-item btn-nav signout-button">
                <button className="btn btn-outline-primary" onClick={this.props.onClick}>
                  Sign Out
                </button>
              </li>
              </div>
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
          <a className="navbar-brand" href="#">ECE INVENTORY</a>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item">
                <Link to="/UserProfile" className="nav-link">PROFILE</Link>
              </li>
              <li className="nav-item">
                <Link to="/Inventory" className="nav-link">INVENTORY</Link>
              </li>
              <li className="nav-item">
                <Link to="/CurrentOrders" className="nav-link">MY REQUESTS</Link>
              </li>
              <div className="navbar-right-panel">
              <li className="nav-item welcome-message">
              Welcome back, {this.props.first_name ? this.props.first_name: this.props.username}.
              </li>
              <li className="nav-item btn-nav signout-button">
                <button className="btn btn-outline-primary" onClick={this.props.onClick}>
                  Sign Out
                </button>
              </li>
              </div>
            </ul>
          </div>
        </nav>
    );

    }
  }
}

export default NavBar;
