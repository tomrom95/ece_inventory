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
      reminders: [],
    }
  }

  componentWillMount(){
    this.instance = axios.create({
		  baseURL: 'https://' + location.hostname,
		  headers: {'Authorization': localStorage.getItem('token')}
		});
    this.loadData();
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

  handleSubjectChange(event){
    var text = event.target.value;
    this.setState({
      subject: text
    });
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
      var date = this.state.reminders[i].date.split('T');
      var row =
      (<tr key={"reminder-"+i} className="subtable-row">
        <th key={this.state.reminders[i].date+"-daterow"}> {date[0]} </th>
        {this.makeEditButton(i)}
        {this.makeDeleteButton(i)}
      </tr>);
      list.push(row);

    }
    return list;
  }

  makeEditButton(i){
    return(
      <td key={"edit-td-"+i} >
        <button
          type="button"
          data-toggle="modal"
          data-target={"#editModal-"+this.state.reminders[i]._id}
          className="btn btn-sm btn-outline-primary"
          key={"editbutton-"+ i}>
            See Body Text
        </button>
        <div className="modal fade"
          id={"editModal-"+this.state.reminders[i]._id}
          tabIndex="-1" role="dialog"
          aria-labelledby="editLabel"
          aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="editLabel">Email body text</h5>
              </div>
              <div className="modal-body">
                {this.makeTextBox(i)}
              </div>
            </div>
          </div>
        </div>
     </td>
    );
  }

  makeTextBox(i){
    return(
      <TextInput
          className="email-text"
          multiline={true}
          numberOfLines={20}
          value={this.state.reminders[i].body}
          key={"email-body"}
          readOnly>
      </TextInput>
    );
  }



  makeDeleteButton(i){
    return(
      <td key={"delete-td-"+i} className="subtable-row">
        <button onClick={()=>this.deleteEmail(i)} key={"delete-button-"+i}
          type="button"
          className="btn btn-sm btn-danger">
            <span className="fa fa-trash"></span>
        </button>
      </td>);
  }

  deleteEmail(i){
    this.instance.delete('/api/emailSettings/loans/' + this.state.reminders[i]._id)
      .then(function(response) {
        if(response.data.error){
          console.log(response);
        }
        else{
          this.loadData();

        }
      }.bind(this))
      .catch(function(error){
        console.log(error);
      });
  }

  submitEmailEdit(i){
    var body = this.state.reminders[i];
    this.instance.put('/api/emailSettings/loans/' + this.state.reminders[i]._id, body)
      .then(function(response) {
        if(response.data.error){
          console.log(response);
        }
        else{
          this.loadData();

        }
      }.bind(this))
      .catch(function(error){
        console.log(error);
      });
  }

  submitSubjectEdit(){
    var body = {
      subject_tag: this.state.subject
    };
    this.instance.put('/api/emailSettings/', body)
      .then(function(response) {
        if(response.data.error){
          console.log(response);
        }
        else{
          console.log(response)
        }
      }.bind(this))
      .catch(function(error){
        console.log(error);
      });
  }



  loadData(){
    this.instance.get('/api/emailSettings')
      .then(function(response) {
        if(response.data.error){
          console.log(response);
        }
        else{
          console.log(response.data.loan_emails);
          this.setState({
            reminders: response.data.loan_emails,
            subject: response.data.subject_tag,
          });

        }
      }.bind(this))
      .catch(function(error){
        console.log(error);
      });
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
          alert(response.data.error);
        }
        else{
          alert("successfully added email to system");
          this.loadData();
          this.clearBody();
        }
      }.bind(this)).catch(function(error) {
        console.log(error);
      });
  }

  clearBody(){
    this.setState({
      body: "",
    })
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
            <div>
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
                <button onClick={() => this.onSubmission()} type="button" className="btn btn-primary">Confirm</button>
  	          </div>
            </div>
            <div>
              <h5 className="card-header email-header">Edit global subject tag</h5>
              <div className="email-box">
                <input type="text"
                    className="email-subject-text"
                    onChange={this.handleSubjectChange.bind(this)}
                    value={this.state.subject}
                    key={"email-subject"}>
                </input>
                <button onClick={() => this.submitSubjectEdit()} type="button" className="btn btn-primary">Apply</button>
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

	      </div>
      );
    }

  }
}

export default LoanEmailReminders;
