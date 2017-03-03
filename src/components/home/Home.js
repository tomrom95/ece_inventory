import React, { Component } from 'react';
import NavBar from '../global/NavBar.js';
import '../../App.css';
import axios from 'axios';
import querystring from 'querystring';
import {browserHistory} from 'react-router';
import jwtDecode from 'jwt-decode'

class Home extends Component {
  constructor(props) {
    super(props);
    if (localStorage.getItem('user')) {
      var user_stored = JSON.parse(localStorage.getItem('user'));
      var token_stored = localStorage.getItem('token');
      if (jwtDecode(token_stored).exp < Date.now() / 1000) {
        localStorage.clear();
        this.state = {
          user: null,
          token: null,
          name: '',
          passwrd: ''
        };
      } else {
        this.state = {user: user_stored,
                      token: token_stored,
                      name: '',
                      passwrd: '',
                    };
      }
    }
    else {
      this.state = {
        user: null,
        token: null,
        name: '',
        passwrd: ''
      };
    }
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handlePasswrdChange = this.handlePasswrdChange.bind(this);
    this.login = this.login.bind(this);
    this.signOut = this.signOut.bind(this);
  }

  componentWillMount() {
    this.checkForOAuth();
  }

  componentDidMount() {
  }

  handleNameChange(event) {
    this.setState({name: event.target.value});
  }

  handlePasswrdChange(event) {
    this.setState({passwrd: event.target.value});
  }

  login() {
    browserHistory.push('/Inventory');
    axios.post('https://' + location.hostname + '/auth/login', {
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
    return false;
  }

  checkForOAuth() {
    if (location.hash) {
      var token = querystring.parse(location.hash.slice(1)).access_token;
      if (!token) return;
      location.hash = '';
      this.setState({loggingIn: true});
      axios.post('https://' + location.hostname + '/auth/login', {
        token: token
      }).then(function(result) {
        if (result.error) {
          console.log(result.error)
        } else {
          localStorage.setItem('user', JSON.stringify(result.data.user));
          localStorage.setItem('token', result.data.token);
          this.setState({
            loggingIn: false,
            token: result.data.token,
            user: result.data.user
          });
        }
      }.bind(this)).catch(function(error) {
        console.log(error);
      });
    }
  }

  signOut() {
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
    var protocol = location.protocol;
    var clientId = 'ece-inventory-' + host.split('.')[0];
    if (protocol === "https:") {
      clientId += "-https";
    }
    return clientId;
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
    if (this.state.loggingIn) {
      return (<div></div>);
    }
    if(this.state.user != null & localStorage.getItem('token') != null){
      let children = null;
      if (this.props.children) {
        children = React.cloneElement(this.props.children, {
          username: this.state.user.username,
          isAdmin: this.state.user.is_admin,
          role: this.state.user.role,
          token: this.state.token,
        });
      }
      return (
        <div className="App">
	         <NavBar onClick={this.signOut} role={this.state.user.role} username={this.state.user.username} first_name={this.state.user.first_name}/>
          <div className="main-container">
            {children}
          </div>
        </div>
      );
    } else
        return(
          <div className="container">
            <div className="row">
              <div className="col-md-6 login-form">
                <div className="form-group">
                  <h3 className="row">Log In Locally</h3>
                  <form onSubmit={e=>{this.login(); e.preventDefault()}}>
                    <div className="form-group row">
                      <label htmlFor="username-field">Username</label>
                      <input type="text"
                          value={this.state.name}
                          className="form-control"
                          id="username-field"
                          placeholder="Username"
                          onChange={this.handleNameChange}/>
                    </div>
                    <div className="form-group row">
                      <label htmlFor="password-field">Password</label>
                      <input type="password"
                        value={this.state.passwrd}
                        className="form-control"
                        id="password-field"
                        placeholder="Password"
                        onChange={this.handlePasswrdChange}/>
                    </div>
                    <div className="form-group row">
                    <button type="submit" className="btn btn-primary">
                        Local Log In
                    </button>
                  </div>
                  </form>
                </div>
              </div>

              <div className="col-md-6 login-form">
                <div className="form-group">
                  <h3 className="row">Log In with your NetID</h3>
                  <div className="form-group row">
                    <a href={this.createNetIDLoginLink()} className="btn btn-primary" role="button">NetID Login</a>
                  </div>
                </div>
              </div>

            </div>


          </div>
          );
  }
}

export default Home;
