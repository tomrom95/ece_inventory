import React, { Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import '../App.css';
import NavBar from './NavBar.js';
import axios from 'axios';
import RequestTable from './RequestTable.js';

var products = [{
      id: 1,
      name: "Item name 1",
      price: 100
  },{
      id: 2,
      name: "Item name 2",
      price: 100
  }];
// It's a data format example.
function priceFormatter(cell, row){
  return '<i class="glyphicon glyphicon-usd"></i> ' + cell;
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
    this.axiosInstance.get('/api/requests')
    .then(function(response) {
      console.log(response.data);
      this.setState({requests: response.data});
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
      console.log("success");
      return (
        <div>
          <RequestTable requests={this.state.requests} isAdmin={true} />
          <BootstrapTable data={ products }>
            <TableHeaderColumn dataField='id' isKey>Product ID</TableHeaderColumn>
            <TableHeaderColumn dataField='name'>Product Name</TableHeaderColumn>
            <TableHeaderColumn dataField='price'>Product Price</TableHeaderColumn>
          </BootstrapTable>
        </div>
      );
    }
  }
}

export default GlobalRequests;
