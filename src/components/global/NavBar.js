import React, { Component } from 'react';
import { Link } from 'react-router';
import '../../App.css';

class NavBar extends Component {
  constructor(props){
    super(props);
    this.state = {
      activeTab: 'INVENTORY'
    }
  }

  setActiveTab(tab) {
    this.setState({
      activeTab: tab
    });
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
                <Link to="/UserProfile" 
                      className={"nav-link" + (this.state.activeTab === "PROFILE" ? " active" : "")}
                      onClick={() => this.setActiveTab("PROFILE")}>
                      PROFILE
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/Inventory" 
                      className={"nav-link" + (this.state.activeTab === "INVENTORY" ? " active" : "")}
                      onClick={() => this.setActiveTab("INVENTORY")}>
                      INVENTORY
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/GlobalRequests" 
                      className={"nav-link" + (this.state.activeTab === "USER REQUESTS" ? " active" : "")}
                      onClick={() => this.setActiveTab("USER REQUESTS")}>
                      USER REQUESTS
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/CurrentOrders" 
                      className={"nav-link" + (this.state.activeTab === "MY REQUESTS" ? " active" : "")}
                      onClick={() => this.setActiveTab("MY REQUESTS")}>
                      MY REQUESTS
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/Log" 
                      className={"nav-link" + (this.state.activeTab === "LOG" ? " active" : "")}
                      onClick={() => this.setActiveTab("LOG")}>
                      LOG
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/CreateUser" 
                      className={"nav-link" + (this.state.activeTab === "CREATE USER" ? " active" : "")}
                      onClick={() => this.setActiveTab("CREATE USER")}>
                      CREATE USER
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/EditUsers" 
                      className={"nav-link" + (this.state.activeTab === "EDIT USERS" ? " active" : "")}
                      onClick={() => this.setActiveTab("EDIT USERS")}>
                      EDIT USERS
                </Link>
              </li>
              <li className="nav-item btn-nav signout-button">
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
          <a className="navbar-brand" href="#">ECE INVENTORY</a>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item">
                <Link to="/UserProfile" 
                      className={"nav-link" + (this.state.activeTab === "PROFILE" ? " active" : "")}
                      onClick={() => this.setActiveTab("PROFILE")}>
                      PROFILE
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/Inventory" 
                      className={"nav-link" + (this.state.activeTab === "INVENTORY" ? " active" : "")}
                      onClick={() => this.setActiveTab("INVENTORY")}>
                      INVENTORY
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/CurrentOrders" 
                      className={"nav-link" + (this.state.activeTab === "MY REQUESTS" ? " active" : "")}
                      onClick={() => this.setActiveTab("MY REQUESTS")}>
                      MY REQUESTS
                </Link>
              </li>
              <li className="nav-item btn-nav signout-button">
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
