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
      this.state = {user: localStorage.getItem('user')};
    }
    else { this.state = {
      user: null,
      name: '',
      passwrd: '',
    };
    }
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handlePasswrdChange = this.handlePasswrdChange.bind(this);
  }
  
  handleNameChange(event) {
    this.setState({name: event.target.value});
  }

  handlePasswrdChange(event) {
    this.setState({passwrd: event.target.value});
  }

  login() {
    axios.post('https://colab-sbx-103.oit.duke.edu:3001/auth/login', {
      username: this.state.name,
      password: this.state.passwrd,
    })
    .then(res => {
      
      if(res.data.token){
        this.setState({
          user: res
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
    console.log("log out");
    localStorage.clear();
    this.setState({
      user: null,
      name: '',
      passwrd: '',
    });



  }
  render() {
    const OPTIONS = {prefix: 'seconds elapsed!', delay: 100};
    if(this.state.user){
      localStorage.setItem('user', this.state.user);
      console.log("test Home");
      console.log(this.state.user);
      return (
        <div className="App">
          <NavBar />
          <p className="App-Intro">Some bull shit</p>
          <Timer options = {OPTIONS} />
          <button className="btn btn-primary" onClick={this.signOut.bind(this)}>
            sign out
	  </button>
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
          <button className="btn btn-primary" onClick={this.login.bind(this)}>
           Log In
          </button>
        </div>
    );
  }
}
}

export default Home;
