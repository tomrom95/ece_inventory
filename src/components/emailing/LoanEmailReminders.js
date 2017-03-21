import React, { Component } from 'react';
import '../../App.css';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import axios from 'axios';
import {TextInput} from 'react-native';

class LoanEmailReminders extends Component {

  constructor(props) {
    super(props);
    this.state = {
      startDate: moment(),
      body: "",
      subject: "",
    }
  }



  componentWillMount(){
    this.instance = axios.create({
		  baseURL: 'https://' + location.hostname,
		  headers: {'Authorization': localStorage.getItem('token')}
		});

  }

  handleDateChange(date) {
    this.setState({
      startDate: date
    });
  }

  handleBodyChange(text){
    this.setState({
      body: text
    })
  }


  onSubmission(){
    var real_date = this.state.startDate.format("YYYY-MM-DD");
    console.log(real_date);
    var object = {
      date: real_date,
      body: this.state.body,
    }
    this.instance.post('/api/emailSettings/loans', object)
      .then(function(response){
        if (response.data.error) {
          console.log(response.data.error);
        }
        else{
          alert("successfully added email to system");
        }
      }.bind(this)).catch(function(error) {
        console.log(error);
      });
  }

  render() {

    if (JSON.parse(localStorage.getItem('user')).role === "STANDARD") {
      return (
        <div className="text-center">
          You are not allowed to access this page
        </div>
      );
    }
    else{
      return(

        <div className="row inventory-page">
          <div className="card date-card">
            <h5 className="card-header">Select reminder date</h5>
              <DatePicker
                dateFormat="YYYY-MM-DD"
                className="date-select"
                selected={this.state.startDate}
                onChange={this.handleDateChange.bind(this)}
                key={"email-date"}/>
          </div>
	        <div className="col-md-9" >

            <h5 className="card-header email-header">Add email body</h5>
	          <div className="email-box">
              <TextInput
                  className="email-text"
                  multiline={true}
                  numberOfLines={20}
                  onChangeText={(text)=>this.handleBodyChange(text)}
                  value={this.state.body}
                  key={"email-body"}>
              </TextInput>
	          </div>
            <h5 className="card-header email-header">Add reminder to system</h5>
            <div className="email-box">
              <button onClick={() => this.onSubmission()} type="button" className="btn btn-primary">Confirm</button>
            </div>
	        </div>

	      </div>
      );
    }

  }
}

export default LoanEmailReminders;
