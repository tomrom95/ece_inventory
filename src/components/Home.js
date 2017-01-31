import React, { Component } from 'react';
import { RouteHandler, Link } from 'react-router';
import NavBar from './NavBar.js';
import '../App.css';
import axios from 'axios';
import Timer from 'react-timer';

class Home extends Component {
  constructor(props) {
    super(props);
    if(localStorage.getItem('user')){
      var user_stored = JSON.parse(localStorage.getItem('user'));
      this.state = {user: user_stored};
    }
    else { this.state = {
      user: null,
      name: '',
      passwrd: '',
    };
    }
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handlePasswrdChange = this.handlePasswrdChange.bind(this);
    this.login = this.login.bind(this);
    this.signOut = this.signOut.bind(this);
  }

  handleNameChange(event) {
    this.setState({name: event.target.value});
  }

  handlePasswrdChange(event) {
    this.setState({passwrd: event.target.value});
  }

  login() {
    console.log('https:' + '//' + location.hostname + ':3001' + '/auth/login');
    axios.post('https:' + '//' + location.hostname + ':3001' + '/auth/login', {
      username: this.state.name,
      password: this.state.passwrd,
    })
    .then(res => {

      if(res.data.token){
        this.setState({
          user: res.data.user
        });
        localStorage.setItem('user', JSON.stringify(this.state.user));
      }
      else{
        console.log(res.data.error);
      }
    })
    .catch(function (error) {
      console.log(error);
    });

  }

  signOut() {
    console.log("log out");
    localStorage.clear();
    this.setState({
      user: null,
      name: '',
      passwrd: '',
    });
  }

  render() {
    let children = null;
    if (this.props.children) {
      children = React.cloneElement(this.props.children, {
        path: this.props.route.path
      })
    }

    if(this.state.user){
      console.log(this.state.user);
      return (
        <div className="App">
	         <NavBar isAdmin={this.state.user.is_admin}  />
           <button className="btn btn-primary" onClick={this.signOut}>
             sign out
           </button>

          <div className="main-container">
            {this.props.children}
          </div>
        </div>

      );
    } else {
      return (
        <div>
          <h4>Log In</h4>
          <form>
            <label>
              Username:
              <input type="text" value={this.state.name} onChange={this.handleNameChange} />
            </label>
            <label>
              Password:
              <input type="text" value={this.state.passwrd} onChange={this.handlePasswrdChange} />
            </label>
          </form>
          <button className="btn btn-primary" onClick={this.login}>
           Log In
          </button>
        </div>
    );
  }
}
}

export default Home;
