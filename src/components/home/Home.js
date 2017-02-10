import React, { Component } from 'react';
import NavBar from '../global/NavBar.js';
import '../../App.css';
import axios from 'axios';
import querystring from 'querystring';

class Home extends Component {
  constructor(props) {
    console.log("CONSTRUCTING!!!");
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

  componentWillMount() {
    console.log("MOUNTING!!!");
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

  getClientID() {
    var host = location.hostname;
    return 'ece-inventory-' + host.split('.')[0];
  }

  createNetIDLoginLink() {
    return "https://oauth.oit.duke.edu/oauth/authorize.php?"
      + querystring.stringify({
        response_type: "token",
        redirect_uri: location.origin,
        client_id: this.getClientID(),
        scope: "basic identity:netid:read",
        state: "458458"
      });
  }

  componentWillUpdate() {
    if(localStorage.getItem('token') && !this.state.token){
      this.setState({
        user: JSON.parse(localStorage.getItem('user')),
        token: localStorage.getItem('token'),
      });
    }
  }

  render() {
    console.log("RENDERING!!!");
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
    } else

        return(
          <div className="login-form container">
            <h3 className="row">Log In Locally</h3>
            <form className="row">
              <div className="form-group">
                <label htmlFor="username-field">Username</label>
                <input type="text"
                    value={this.state.name}
                    className="form-control"
                    id="username-field"
                    placeholder="Username"
                    onChange={this.handleNameChange}/>
              </div>
              <div className="form-group">
                <label htmlFor="password-field">Password</label>
                <input type="password"
                  value={this.state.passwrd}
                  className="form-control"
                  id="password-field"
                  placeholder="Password"
                  onChange={this.handlePasswrdChange}/>
              </div>
            </form>
            <button className="btn btn-primary" onClick={this.login}>
                Local Log In
            </button>
            <h3 className="row">Log In with your NetID</h3>
            <a href={this.createNetIDLoginLink()} className="btn btn-primary" role="button">NetID Login</a>
          </div>
          <h3 className="row">Log In with your NetID</h3>
            <a href={this.createNetIDLoginLink().bind(this)} class="btn btn-primary" role="button">NetID Login</a>
          );
  }
}

export default Home;
