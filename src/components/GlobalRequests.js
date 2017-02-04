import React, { Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import '../App.css';
import NavBar from './NavBar.js';
import axios from 'axios';
import RequestTable from './RequestTable.js';

function processData(responseData) {
  var requests = responseData;
  var i;
  var items = [];
  for (i=0; i<requests.length; i++) {
    var obj = requests[i];
    var item = {
      "Item": obj.item.name,
      "Time Stamp": obj.created,
      "Quantity": obj.quantity,
      "Reason": obj.reason,
      "Status": obj.status,
      "_id": obj._id,
      "user_id": obj.user_id,
      "item_id": obj.item._id,
    };
    items.push(item);
  }
  console.log(items);
  return items;
}


class GlobalRequests extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      requests: []
    };
  }

  componentWillMount() {
    this.axiosInstance = axios.create({
      baseURL: 'https://' + location.hostname + ':3001',
      headers: {'Authorization': localStorage.getItem('token')}
    });
    var api = '/api/requests';
    if (this.props.itemID && this.props.status) {
      api += '?item_id=' + this.props.itemID + "&status=" + this.props.status;
    }
    this.axiosInstance.get(api)
    .then(function(response) {
      console.log(response.data);
      this.setState({requests: processData(response.data)});
    }.bind(this))
    .catch(function(error) {
      console.log(error);
    }.bind(this));

  }

  render() {
    if(!this.state.requests || this.state.requests.length == 0){
      return(<div></div>);
    }
    else{
      return (
        <div className="wide">
          <RequestTable api={this.axiosInstance} data={this.state.requests} isAdmin={true} />

        </div>
      );
    }
  }
}

export default GlobalRequests;
