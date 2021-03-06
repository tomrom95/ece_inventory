import React from 'react';
import axios from 'axios';

const DUPLICATE_ERROR = 11000;

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
      baseURL: 'https://' + location.hostname + '/api',
      headers: {'Authorization': localStorage.getItem('token')}
    });
  }

  submitForm() {
    var data = {
      username: this.refs.username.value,
      password: this.refs.password.value,
      role: this.refs.role.value,
      email: this.refs.email.value
    };
    var passwordConfirm = this.refs.passwordConfirm.value;

    if (data.username === "" || data.password === "") {
      this.setState({success: null, error: 'Please fill out the required fields'});
      return;
    }

    if (data.password !== passwordConfirm) {
      this.setState({success: null, error: 'Passwords do not match'});
      return
    }

    this.axiosInstance.post('/users', data)
      .then(function(response) {
        if (response.data.error) {
          console.log(response.data.error);
          if (response.data.error.code === DUPLICATE_ERROR) {
            this.setState({success: null, error: 'A user with this username already exists'});
          } else {
            this.setState({success: null, error: 'Could not complete request to add user'});
          }
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
    this.refs.role.value = 'STANDARD';
    this.refs.email.value = '';
    this.refs.passwordConfirm.value = '';
  }

  render() {
    if (this.state.currUser == null) {
      return (<div></div>);
    }
    if (this.state.currUser.role !== "ADMIN") {
      return (
        <div className="text-center">
          You are not allowed to access this page
        </div>
      );
    }
    return (
      <div className="row">
        <div className="offset-md-4 col-md-4 container">
          <div>
            <div className="center-text">
              <h3>Create New User</h3>
            </div>
          </div>
          <div className="form-fields">
            <div className="row form-group">
              <label htmlFor={"username-field"}>Username *</label>
              <input
                className="form-control"
                type="text"
                ref="username"
                defaultValue=""
                id={"username-field"}/>
            </div>
            <div className="row form-group">
              <label htmlFor={"username-field"}>Email *</label>
              <input
                className="form-control"
                type="text"
                ref="email"
                defaultValue=""
                id={"email-field"}/>
            </div>
            <div className="row form-group">
              <label htmlFor={"pw-field"}>Password *</label>
              <input
                className="form-control"
                type="password"
                ref="password"
                defaultValue=""
                id={"pw-field"}/>
            </div>
            <div className="row form-group">
              <label htmlFor={"confirm-field"}>Confirm Password *</label>
              <input
                className="form-control"
                type="password"
                ref="passwordConfirm"
                defaultValue=""
                id={"confirm-field"}/>
            </div>
            <div className="row form-group">
              <label htmlFor={"role-field"}>Role *</label>
              <select id={"role-field"} className="form-control" ref="role">
                <option>STANDARD</option>
                <option>MANAGER</option>
                <option>ADMIN</option>
              </select>
            </div>
            <div className="text-right row">
              <button
                className="btn btn-primary"
                onClick={this.submitForm.bind(this)}>
                Submit
              </button>
            </div>
          </div>
          {this.state.error ? (
            <div className="row">
              <div className="alert alert-danger">
                <strong>Error:</strong> {this.state.error}
              </div>
            </div>
          ): null}
          {this.state.success ? (
            <div className="row">
              <div className="alert alert-success">
                <strong>Success!</strong> {this.state.success}
              </div>
            </div>
          ): null}
        </div>
      </div>
    );
  }
}

export default CreateUser;
