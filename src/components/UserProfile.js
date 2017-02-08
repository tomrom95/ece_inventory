import React, { Component } from 'react';
import '../App.css';

class UserProfile extends Component {

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
        <h4 className="card-header">{this.props.username}</h4>
        <div className="card-block">
          <h5 className="card-title row">Privilege Level:</h5>
          <p className="card-title row"> {status} </p>
        </div>
      </div>
    );
  }


}

export default UserProfile;
