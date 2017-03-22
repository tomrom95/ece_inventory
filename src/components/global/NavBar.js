import React, { Component } from 'react';
import { Link } from 'react-router';
import '../../App.css';

class NavBar extends Component {
  constructor(props){
    super(props);
    this.state = {
      activeTab: window.location.pathname
    }
  }

  setActiveTab(tab) {
    this.setState({
      activeTab: tab
    });
  }

  render() {

    if(this.props.role === "ADMIN" ){

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
                      className={"nav-link" + (this.state.activeTab === "/UserProfile" ? " active" : "")}
                      onClick={() => this.setActiveTab("/UserProfile")}>
                      PROFILE
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/Inventory"
                      className={"nav-link" + (this.state.activeTab === "/Inventory" ? " active" : "")}
                      onClick={() => this.setActiveTab("/Inventory")}>
                      INVENTORY
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/GlobalRequests"
                      className={"nav-link" + (this.state.activeTab === "/GlobalRequests" ? " active" : "")}
                      onClick={() => this.setActiveTab("/GlobalRequests")}>
                      USER REQUESTS
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/CurrentOrders"
                      className={"nav-link" + (this.state.activeTab === "/CurrentOrders" ? " active" : "")}
                      onClick={() => this.setActiveTab("/CurrentOrders")}>
                      MY REQUESTS
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/Log"
                      className={"nav-link" + (this.state.activeTab === "/Log" ? " active" : "")}
                      onClick={() => this.setActiveTab("/Log")}>
                      LOG
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/LoanEmailReminders"
                      className={"nav-link" + (this.state.activeTab === "/LoanEmailReminders" ? " active" : "")}
                      onClick={() => this.setActiveTab("/LoanEmailReminders")}>
                      REMINDERS
                </Link>
              </li>

              <li className="nav-item">
                <Link to="/CreateUser"
                      className={"nav-link" + (this.state.activeTab === "/CreateUser" ? " active" : "")}
                      onClick={() => this.setActiveTab("/CreateUser")}>
                      CREATE USER
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/EditUsers"
                      className={"nav-link" + (this.state.activeTab === "/EditUsers" ? " active" : "")}
                      onClick={() => this.setActiveTab("/EditUsers")}>
                      EDIT USERS
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/Docs"
                      className={"nav-link" + (this.state.activeTab === "/Docs" ? " active" : "")}
                      onClick={() => this.setActiveTab("/Docs")}>
                      DOCS
                </Link>
              </li>
              <div className="navbar-right-panel">
                <li className="nav-item welcome-message">
                Welcome back, <strong>{this.props.first_name ? this.props.first_name: this.props.username}</strong>
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
    else if(this.props.role === "MANAGER"){
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
                      className={"nav-link" + (this.state.activeTab === "/UserProfile" ? " active" : "")}
                      onClick={() => this.setActiveTab("/UserProfile")}>
                      PROFILE
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/Inventory"
                      className={"nav-link" + (this.state.activeTab === "/Inventory" ? " active" : "")}
                      onClick={() => this.setActiveTab("/Inventory")}>
                      INVENTORY
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/GlobalRequests"
                      className={"nav-link" + (this.state.activeTab === "/GlobalRequests" ? " active" : "")}
                      onClick={() => this.setActiveTab("/GlobalRequests")}>
                      USER REQUESTS
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/CurrentOrders"
                      className={"nav-link" + (this.state.activeTab === "/CurrentOrders" ? " active" : "")}
                      onClick={() => this.setActiveTab("/CurrentOrders")}>
                      MY REQUESTS
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/Log"
                      className={"nav-link" + (this.state.activeTab === "/Log" ? " active" : "")}
                      onClick={() => this.setActiveTab("/Log")}>
                      LOG
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/LoanEmailReminders"
                      className={"nav-link" + (this.state.activeTab === "/LoanEmailReminders" ? " active" : "")}
                      onClick={() => this.setActiveTab("/LoanEmailReminders")}>
                      REMINDERS
                </Link>
              </li>

              <div className="navbar-right-panel">
                <li className="nav-item welcome-message">
                  Welcome back, <strong>{this.props.first_name ? this.props.first_name: this.props.username}</strong>
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
                <Link to="/UserProfile"
                      className={"nav-link" + (this.state.activeTab === "/UserProfile" ? " active" : "")}
                      onClick={() => this.setActiveTab("/UserProfile")}>
                      PROFILE
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/Inventory"
                      className={"nav-link" + (this.state.activeTab === "/Inventory" ? " active" : "")}
                      onClick={() => this.setActiveTab("/Inventory")}>
                      INVENTORY
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/CurrentOrders"
                      className={"nav-link" + (this.state.activeTab === "/CurrentOrders" ? " active" : "")}
                      onClick={() => this.setActiveTab("/CurrentOrders")}>
                      MY REQUESTS
                </Link>
              </li>
              <div className="navbar-right-panel">
                <li className="nav-item welcome-message">
                  Welcome back, <strong>{this.props.first_name ? this.props.first_name: this.props.username}</strong>
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
