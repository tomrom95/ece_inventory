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
    this.state = {
      _id: props._id,
      editMode: false,
      tabSelected: props.showDetailedPage ? "requests" : "profile_info",
      showDetailedPage: props.showDetailedPage,
      disableEditing: props.disableEditing || false
    }
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      _id: newProps._id
    }, () => {
      this.loadUser();
    });
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
      this.setUser(user);
    }.bind(this)).catch(function(error) {
      console.log(error);
    });
  }

  setUser(user) {
    this.setState({
      _id: user._id,
      netid: user.netid,
      username: user.username,
      role: user.role,
      email: user.email,
      subscribed: user.subscribed ? user.subscribed : false,
      firstName: user.first_name,
      lastName: user.last_name,
      editMode: false
    });
  }

  makeActiveView() {
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
    else if (this.state.tabSelected === "profile_info") {
      return this.state.editMode ? this.renderEditMode() : this.renderViewMode();
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
    if (this.state.checked)
      this.refs.subscribedCheckbox.checked = this.state.subscribed;
    this.setState({editMode: false});
  }

  submitButtonClick() {
    var params = {
      email: this.refs.email.value,
      first_name: this.refs.firstName.value,
      last_name: this.refs.lastName.value
    };
    if (this.refs.subscribedCheckbox) {
      params.subscribed = this.refs.subscribedCheckbox.checked
    }
    this.instance.put('/api/users/' + this.state._id, params)
    .then(function(response){
      if (response.data.error) {
        console.log(response.data.error);
      }
      else{
        var user = response.data;
        localStorage.setItem('user', JSON.stringify(user));
        this.setUser(user);
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
        <div className="card-block user-card-block">
          <h5 className="card-title row">Subscribed:</h5>
          <input
            type="checkbox"
            ref={"subscribedCheckbox"}
            key={"subscribedCheckbox"}
            defaultChecked={this.state.subscribed}
          />
        </div>
      );
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
          {subscribed}
          <div className="row card-block">

              <button
                className="btn btn-primary"
                onClick={this.submitButtonClick.bind(this)} >
                Submit
              </button>
              <button
                className="btn btn-danger"
                onClick={this.cancelButtonClick.bind(this)} >
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
      <div className="userprofile-side-panel">
        <div className="card user-info center-text">
          {userNameField}
          { this.state.firstName || this.state.lastName ?
            (<div className="card-block user-card-block">
              <h5 className="card-title row">Name:</h5>
              <p className="card-title row">
                {(this.state.firstName || '') + ' ' + (this.state.lastName || '')}
              </p>
            </div>) : null }
          <div className="card-block user-card-block">
            <h5 className="card-title row">Email:</h5>
            <p className="card-title row"> {this.state.email} </p>
          </div>
          <div className="card-block user-card-block">
            <h5 className="card-title row">Privilege Level:</h5>
            <p className="card-title row"> {this.state.role} </p>
          </div>
          {subscribed}
          { this.state.disableEditing ? null :
            <div className="card-block user-card-block">
              <button
                className="btn btn-primary"
                onClick={this.editButtonClick.bind(this)}
              >
                Edit
              </button>
            </div>
          }
        </div>
      </div>
    );
  }

  render() {
    return(
      <div>
        { this.state.showDetailedPage ?
          <ul className="nav nav-links userpage-tabs-container">
            <li className="nav-item userpage-tab-container">
              <a className="nav-link userpage-tab"
                  href="#"
                  onClick={e => this.setActiveTab("profile_info")}>
                  User Profile
              </a>
            </li>
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
        : null }

          <div className="row userprofile-page">
              {this.makeActiveView()}
          </div>
      </div>
    );
  }
}

export default UserProfile;
