import React, { Component } from 'react';
import Select from 'react-select';

class UserSelect extends Component {
  constructor(props){
    super(props);
    this.state = {
      allUsers: [],
      selectedUserId: this.props.defaultUserId
    }
  }

  getSelectedUserId() {
    return this.state.selectedUserId;
  }

  clearUser() {
    this.setState({
      selectedUserId: null
    });
  }

  mapUsers(users) {
    return users.map(function(user) {
      var label = user.username;
      if (user.first_name && user.last_name) {
        label = user.first_name + ' ' + user.last_name;
        if (user.netid) {
          label += ' (' + user.netid + ')';
        } else {
          label += ' (' + user.username + ')';
        }
      } else if (user.netid) {
        label = user.netid;
      }
      return {label: label, value: user._id};
    });
  }

  componentWillMount() {
    this.props.api.get('/api/users')
      .then(function(response) {
        if (response.error) {
          console.log(response.error);
        }
        var data = this.mapUsers(response.data);
        this.setState({allUsers: data});
      }.bind(this))
      .catch(function(error) {
        console.log(error);
      });
  }

  handleChange(value) {
    this.setState({selectedUserId: value});
    if (this.props.callback)
      this.props.callback(value);

  }

  render() {
    return (
      <Select
        simpleValue
        value={this.state.selectedUserId}
        clearable={true}
        placeholder="Choose user"
        options={this.state.allUsers}
        onChange={this.handleChange.bind(this)}
      />
    );
  }

}

export default UserSelect;
