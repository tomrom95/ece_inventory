import React, { Component } from 'react';
import '../../App.css';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import axios from 'axios';
import {TextInput} from 'react-native';

var meta;

function getPrefill(data) {
  return ({
    "Date": data["Date"],
    "Body": data["Body"],
  });
}

function getEmptyPrefill() {
  return ({
    "Date": "",
    "Body": "",
  });
}

function getKeys(data) {

  if (data.length === 0)
    return;

  var keys = Object.keys(data[0]);
  var i;
  var ret = [];
  for (i=0; i<keys.length; i++) {
    if (keys[i] === "meta") {
      meta = keys[i];
      continue;
    }

    if (["Date", "Body"].includes(keys[i])) {
      ret.push(keys[i]);
    }
  }
  return ret;
}

function getValues(data, keys) {
  var i; var j;
  var vals = [];
  for (i=0; i<data.length; i++) {
    var row = [];
    for (j=0; j<keys.length; j++) {
      row.push(String(data[i][keys[j]]).replace(/,/g,', '));
    }
    vals.push(row);
  }
  return vals;
}

class AllRemindersPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      subject: "",
      reminders: [],
    }
  }

  loadData(){
    this.instance.get('/api/emailSettings')
      .then(function(response) {
        if(response.data.error){
          console.log(response);
        }
        else{
          this.setState({
            reminders: response.data.load_emails,
            subject: response.data.subject_tag,
          });

        }
      }.bind(this))
      .catch(function(error){
        console.log(error);
      });
  }


  handleSubjectChange(event){
    var text = event.target.value;
    this.setState({
      subject: text
    })
  }


  componentWillMount(){
    this.instance = axios.create({
		  baseURL: 'https://' + location.hostname,
		  headers: {'Authorization': localStorage.getItem('token')}
		});
    this.loadData();
  }

  makeColumnKeyElements(){
    var list = [];
    list.push(<th key={"date-remindercol"}> Date </th>);
    list.push(<th key={"body-remindercol"}> Body </th>)
    return list;
  }

  makeRows(){
    var list = [];
    for(var i = 0; i < this.state.reminders.length; i++){
      list.push(<th key={this.state.reminders[i].loan_emails.date+"-reminderrow"}> {this.state.reminders[i].loan_emails.date} </th>);
      list.push(<th key={this.state.reminders[i].loan_emails.body+"-reminderrow"}> {this.state.reminders[i].loan_emails.body} </th>);
    }
    return list;
  }

  onSubmission(){

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
          <div className="col-md-9" >

            <h5 className="card-header email-header">Edit global subject tag</h5>
            <div className="email-box">
              <input type="text"
                  className="email-subject-text"
                  onChange={this.handleSubjectChange.bind(this)}
                  value={this.state.subject}
                  key={"email-subject"}>
              </input>
            </div>
            <div className="reminder-table">
      				<table className="table table-sm maintable-body">
      				  <thead className="thread">
      				    <tr>
      			    	  {this.makeColumnKeyElements()}
      				    </tr>
      				  </thead>
      				  <tbody>
      				  	{this.makeRows()}
      				  </tbody>
      				</table>
      			</div>
          </div>

        </div>
      );
    }

  }
}

export default AllRemindersPage;
