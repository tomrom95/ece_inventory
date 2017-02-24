import React, { Component } from 'react';
import '../../App.css';

class UserProfile extends Component {

  /*
    Props are:
      username (string)
      isAdmin (boolean) --> this needs to be changed to an enum
  */

  constructor(props) {
    super(props);
    this.state = {
      username: props.username,
      role: props.role
    }
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      username: newProps.username,
      role: newProps.role
    });
  }

  render() {
    var status = '';
    if(this.props.isAdmin){
      status = 'Administrator';
    }
    else{
      status = 'Non-Administrator';
    }

    return(
      <div className="card user-info center-text">
        <h4 className="card-header">{this.state.username}</h4>
        <div className="card-block">
          <h5 className="card-title row">Privilege Level:</h5>
          <p className="card-title row"> {this.state.role} </p>
        </div>
      </div>
    );
  }
}

export default UserProfile;
