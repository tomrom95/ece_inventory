import React, { Component } from 'react';
import '../../App.css';
import axios from 'axios';

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
      subscribed: props.subscribed,
    }
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      _id: newProps._id,
      username: newProps.username,
      role: newProps.role,
      email: newProps.email,
      subscribed: newProps.subscribed,
    });
  }

  componentWillMount(){
    this.instance = axios.create({
		  baseURL: 'https://' + location.hostname,
		  headers: {'Authorization': localStorage.getItem('token')}
		});
  }

  handleChange(event){
    this.setState({
      subscribed: !this.state.subscribed,
    })
    this.instance.put('/api/users/' + this.state._id, {
      subscribed: this.state.subscribed,
    }).then(function(response){
      if (response.data.error) {
        console.log(response.data.error);
      }
      else{
        alert("successfully changed subscribe status");
      }
    }.bind(this)).catch(function(error) {
      console.log(error);
    });
  }

  subscribeToEmails(){
    var subscribed = <input type="checkbox"
          checked={this.state.subscribed}
          onChange={e=>this.handleChange(e)}
          ref={"subcribe-checkbox"}
          key={"subcribe-checkbox"}>
          </input>
    if(this.state.role === "STANDARD"){
      return(<div></div>);
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
              {this.state.email}
            </h6>
            <div className="card-title row"> {subscribed} </div>
          </div>
        </div>);
    }

  }

  render() {


    return(
      <div>
        <div className="card user-info center-text">
          <h4 className="card-header">{this.state.username}</h4>
          <div className="card-block">
            <h5 className="card-title row">Privilege Level:</h5>
            <p className="card-title row"> {this.state.role} </p>
          </div>

        </div>
        {this.subscribeToEmails()}
      </div>
    );
  }
}

export default UserProfile;
