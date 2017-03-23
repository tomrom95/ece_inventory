import React, { Component } from 'react';
import CreateUser from './CreateUser.js';
import EditUsers from './EditUsers.js';
import '../../App.css';

class UsersTab extends Component {
  constructor(props) {
		super(props);
	}

  render() {
    return (
      <div>
        <CreateUser />
        <br/>
        <EditUsers />
      </div>
    );
  }
}

export default UsersTab;
