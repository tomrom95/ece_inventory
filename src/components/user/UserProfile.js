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
      username: props.username,
      role: props.role,
      email: props.email,
      subscribed: props.subscribed ? props.subscribed : false,
      tabSelected: "requests"
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
      if (response.error) {
        console.log(response.error);
      }
      this.setState(response.data);
    }.bind(this)).catch(function(error) {
      console.log(error);
    });
  }

  handleChange(event){
    var isChecked = event.target.checked;
    this.instance.put('/api/users/' + this.state._id, {
      subscribed: isChecked,
    }).then(function(response){
      if (response.data.error) {
        console.log(response.data.error);
      }
      else{
        this.setState({
          subscribed: isChecked,
        });
        alert("Successfully changed subscribe status.");
      }
    }.bind(this)).catch(function(error) {
      console.log(error);
    });
  }

  subscribeToEmails(){
    var subscribed = (<input
      type="checkbox"
      checked={this.state.subscribed}
      onChange={e=>this.handleChange(e)}
      ref={"subcribe-checkbox"}
      key={"subcribe-checkbox"} />);
    if(this.state.role === "STANDARD"){
      return null;
    }
    else{

      return(
        <div className="card user-info">
          <h4 className="card-header">Subscribe?</h4>
          <div className="card-block">
            <h6 className="card-title row">
              Subscribing will cause an email to be sent to your account whenever a user request is filed.
            </h6>
            <h6 className="card-title row">
              <strong> {this.state.email} </strong>
            </h6>
            <div className="card-title row">
              <label>
              {subscribed}
              {" Subscribed"}
              </label>
            </div>

          </div>
        </div>);
    }

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

            <div className="col-md-3 userprofile-side-panel">
              <div className="card user-info center-text">
              <h4 className="card-header">{this.state.username}</h4>
              <div className="card-block">
                <h5 className="card-title row">Privilege Level:</h5>
                <p className="card-title row"> {this.state.role} </p>
              </div>
              <div className="card-block">
                <h5 className="card-title row">Email:</h5>
                <p className="card-title row"> {this.state.email} </p>
              </div>
            </div>
            {this.subscribeToEmails()}
              </div>
            </div>
        </div>


      </div>
    );
  }
}

export default UserProfile;
