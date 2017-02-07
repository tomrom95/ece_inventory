import React from 'react';
import axios from 'axios';

class CreateUser extends React.Component {
  constructor(props) {
    super(props);
    var currUser = JSON.parse(localStorage.getItem('user'));
    this.state = {
      newUsername: "",
      newPassword: "",
      isAdmin: false,
      currUser: currUser,
      error: null,
      success: null
    }
  }

  componentWillMount() {
    this.axiosInstance = axios.create({
      baseURL: 'https://' + location.hostname + ':3001/api',
      headers: {'Authorization': localStorage.getItem('token')}
    });
  }

  submitForm() {
    var data = {
      username: this.refs.username.value,
      password: this.refs.password.value,
      is_admin: this.refs.isAdmin.checked,
    };

    if (data.username === "" || data.password === "") {
      this.setState({success: null, error: 'Please fill out the required fields'});
      return;
    }

    this.axiosInstance.post('/user', data)
      .then(function(response) {
        if (response.data.error) {
          console.log(response.data.error);
          this.setState({success: null, error: 'Could not complete request to add user'});
        } else {
          this.setState({error: null, success: 'Added user successfully'});
          this.clearFields();
        }
      }.bind(this))
      .catch(function(error) {
        this.setState({success: null, error: 'Could not complete request to add user'});
        console.log(error);
      }.bind(this));
  }

  clearFields() {
    this.refs.username.value = '';
    this.refs.password.value = '';
    this.refs.isAdmin.checked = false;
  }

  render() {
    if (this.state.currUser == null) {
      return (<div></div>);
    }
    if (!this.state.currUser.is_admin) {
      return (
        <div>
          You are not allowed to access this page
        </div>
      );
    }
    return (
      <div className="row">
        <div className="offset-md-4 col-md-4">
          <div className="row">
            <div className="center-text">
              <h4>Add a new user</h4>
            </div>
          </div>
          <div className="form-fields">
            <div>
              <label>Username *</label>
              <input
                className="form-control"
                type="text"
                ref="username"
                defaultValue=""
              />
            </div>
            <div>
              <label>Password *</label>
              <input
                className="form-control"
                type="text"
                ref="password"
                defaultValue=""
              />
            </div>
            <div>
              <label>Make admin?</label>
              <input type="checkbox" ref="isAdmin"></input>
            </div>
            <div className="form-footer">
              <button
                className="btn btn-primary pull-right"
                onClick={this.submitForm.bind(this)}
              >
                Submit
              </button>
            </div>
            {this.state.error ? (
              <div className="pull-right">
                <div className="alert alert-danger">
                  <strong>Error:</strong> {this.state.error}
                </div>
              </div>
            ): null}
            {this.state.success ? (
              <div className="pull-right">
                <div className="alert alert-success">
                  <strong>Success!</strong> {this.state.success}
                </div>
              </div>
            ): null}
          </div>
        </div>
      </div>
    );
  }
}

export default CreateUser;
