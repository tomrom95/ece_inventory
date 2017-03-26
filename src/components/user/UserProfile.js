import React, { Component } from 'react';
import '../../App.css';
import axios from 'axios';
import CurrentOrders from '../requests/CurrentOrders.js';
import LoanPage from '../loans/LoanPage.js';

class UserProfile extends Component {

  /*
    Props are:
      username (string)
      role (string)
  */

  constructor(props) {
    super(props);
    var user = JSON.parse(localStorage.getItem('user'));
    this.state = {
      _id: user._id,
      tabSelected: "requests",
      editMode: false
    }
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      _id: newProps._id
    });
    this.loadUser();
  }

  componentWillMount(){
    this.instance = axios.create({
		  baseURL: 'https://' + location.hostname,
		  headers: {'Authorization': localStorage.getItem('token')}
		});
    this.loadUser();
  }

  loadUser() {
    this.instance.get('/api/users/' + this.state._id).then(function(response) {
      if (response.data.error) {
        console.log(response.data.error);
      }
      var user = response.data;
      this.setState({
        _id: user._id,
        netid: user.netid,
        username: user.username,
        role: user.role,
        email: user.email,
        subscribed: user.subscribed ? user.subscribed : false,
        firstName: user.first_name,
        lastName: user.last_name,
      });
    }.bind(this)).catch(function(error) {
      console.log(error);
    });
  }

  makeTableView() {
    var table = null;
    if (this.state.tabSelected === "requests") {
      table = (<CurrentOrders
              showFilterBox={false}
              showStatusFilterBox={true}
              hasOtherParams={false}/>);
    }

    else if (this.state.tabSelected === "loans") {
      var filters = {
        user_id: JSON.parse(localStorage.getItem('user'))._id
      }

      table = (<LoanPage isGlobal={false}
                         showFilterBox={true}
                         filters={filters}/>);
    }

    return (<div className="userprofile-table">
              {table}
            </div>);
  }

  setActiveTab(tab) {
    this.setState({
      tabSelected: tab
    });
  }

  editButtonClick() {
    this.setState({editMode: true});
  }

  cancelButtonClick() {
    ['email', 'firstName', 'lastName'].forEach(function(field) {
      this.refs[field].value = this.state[field];
    }.bind(this));
    this.refs.subscribedCheckbox.checked = this.state.subscribed;
    this.setState({editMode: false});
  }

  submitButtonClick() {
    this.instance.put('/api/users/' + this.state._id, {
      subscribed: this.refs.subscribedCheckbox.checked,
      email: this.refs.email.value,
      first_name: this.refs.firstName.value,
      last_name: this.refs.lastName.value
    }).then(function(response){
      if (response.data.error) {
        console.log(response.data.error);
      }
      else{
        var user = response.data;
        localStorage.setItem('user', JSON.stringify(user));
        this.setState({
          _id: user._id,
          username: user.username,
          netid: user.netid,
          role: user.role,
          email: user.email,
          subscribed: user.subscribed ? user.subscribed : false,
          firstName: user.first_name,
          lastName: user.last_name,
          editMode: false
        });
        alert("Successfully edited your profile.");
      }
    }.bind(this)).catch(function(error) {
      console.log(error);
    });
  }

  renderEditMode() {
    var subscribed = null;
    if (this.state.role !== 'STANDARD') {
      subscribed = (
        <div className="card-block">
          <h5 className="card-title row">Subscribed to Emails:</h5>
          <p className="card-title row"> {this.state.subscribed} </p>
        </div>
      )
    }

    return(
      <div className="col-md-3 userprofile-side-panel">
        <div className="card user-info center-text">
          <div className="card-block user-card-block">
            <h5 className="card-title row">Email:</h5>
            <input
              className="form-control"
              type="text"
              ref="email"
              defaultValue={this.state.email}
              id={"email-field"}/>
          </div>
          <div className="card-block user-card-block">
            <h5 className="card-title row">First Name:</h5>
            <input
              className="form-control"
              type="text"
              ref="firstName"
              defaultValue={this.state.firstName}
              id={"first-name-field"}/>
          </div>
          <div className="card-block user-card-block">
            <h5 className="card-title row">Last Name:</h5>
            <input
              className="form-control"
              type="text"
              ref="lastName"
              defaultValue={this.state.lastName}
              id={"last-name-field"}/>
          </div>
          <div className="card-block user-card-block">
            <h5 className="card-title row">Subscribed:</h5>
            <input
              type="checkbox"
              ref={"subscribedCheckbox"}
              key={"subscribedCheckbox"}
              defaultChecked={this.state.subscribed}
            />
          </div>
          <div className="card-block user-card-block">
            <button
              className="btn btn-primary"
              onClick={this.submitButtonClick.bind(this)}
            >
              Submit
            </button>
          </div>
          <div className="card-block user-card-block">
            <button
              className="btn btn-primary"
              onClick={this.cancelButtonClick.bind(this)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  renderViewMode() {
    var subscribed = null;
    if (this.state.role !== 'STANDARD') {
      var subscribedText = this.state.subscribed ? 'Yes' : 'No';
      subscribed = (
        <div className="card-block user-card-block">
          <h5 className="card-title row">Subscribed to Emails:</h5>
          <p className="card-title row"> {subscribedText} </p>
        </div>
      )
    }

    var userNameField = null;
    if (this.state.username) {
      userNameField = (
        <div className="card-block user-card-block">
          <h5 className="card-title row">Username:</h5>
          <p className="card-title row"> {this.state.username} </p>
        </div>
      );
    } else {
      userNameField = (
        <div className="card-block user-card-block">
          <h5 className="card-title row">Net ID:</h5>
          <p className="card-title row"> {this.state.netid} </p>
        </div>
      );
    }

    return(
      <div className="col-md-3 userprofile-side-panel">
        <div className="card user-info center-text">
          {userNameField}
          <div className="card-block user-card-block">
            <h5 className="card-title row">Name:</h5>
            <p className="card-title row"> {this.state.firstName + ' ' + this.state.lastName} </p>
          </div>
          <div className="card-block user-card-block">
            <h5 className="card-title row">Email:</h5>
            <p className="card-title row"> {this.state.email} </p>
          </div>
          <div className="card-block user-card-block">
            <h5 className="card-title row">Privilege Level:</h5>
            <p className="card-title row"> {this.state.role} </p>
          </div>
          {subscribed}
          <div className="card-block user-card-block">
            <button
              className="btn btn-primary"
              onClick={this.editButtonClick.bind(this)}
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return(
      <div className="row">
        <div className="col-md-12">
          <ul className="nav nav-links userpage-tabs-container">
            <li className="nav-item userpage-tab-container">
              <a className="nav-link userpage-tab"
                  href="#"
                  onClick={e => this.setActiveTab("requests")}>
                  My Requests
              </a>
            </li>
            <li className="nav-item userpage-tab-container">
              <a className="nav-link userpage-tab"
                  href="#"
                  onClick={e => this.setActiveTab("loans")}>
                  My Loans
              </a>
            </li>
          </ul>
          <div className="row userprofile-page">
            <div className="col-md-9">
              {this.makeTableView()}
            </div>
            {this.state.editMode ? this.renderEditMode() : this.renderViewMode()}
          </div>
        </div>


      </div>
    );
  }
}

export default UserProfile;
