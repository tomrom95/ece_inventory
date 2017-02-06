import React, { Component } from 'react';
import NavBar from './NavBar.js';
import '../App.css';
import axios from 'axios';

class Home extends Component {
  constructor(props) {
    super(props);
    if(localStorage.getItem('user')){
      var user_stored = JSON.parse(localStorage.getItem('user'));
      var token_stored = localStorage.getItem('token');
      this.state = {user: user_stored,
                    token: token_stored,
                    name: '',
                    passwrd: '',
                  };

    }
    else {
      this.state = {
        user: null,
        token: null,
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
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('token', res.data.token);
        this.setState({
          user: res.data.user,
          token: res.data.token,
        });
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
    console.log(this.state.token);
    localStorage.clear();
    this.setState({
      user: null,
      token: null,
      name: '',
      passwrd: '',
    });
  }

  render() {

    if(this.state.user != null & localStorage.getItem('token') != null){
      let children = null;
      if (this.props.children) {
        children = React.cloneElement(this.props.children, {
          username: this.state.user.username,
          isAdmin: this.state.user.is_admin,
          token: this.state.token,
        });
      }
      console.log(this.state.user);
      return (
        <div className="App">
	         <NavBar isAdmin={this.state.user.is_admin} onClick={this.signOut}/>

          <div className="main-container">
            {children}
          </div>
        </div>

      );
    } else {
      return (
        <div>
          <h4>Please sign in to your account</h4>
          <form>
            <label>
              Username:
              <input type="text" value={this.state.name} onChange={this.handleNameChange} />
            </label>
            <label>
              Password:
              <input type="password" value={this.state.passwrd} onChange={this.handlePasswrdChange} />
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
