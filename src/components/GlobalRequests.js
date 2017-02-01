import React, { Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import '../App.css';
import NavBar from './NavBar.js';
import axios from 'axios';


var products = [{
      name: "admin",
      id: 43,
      serial: 329109,
      quantity: 1
  }];
// It's a data format example.
function priceFormatter(cell, row){
  return '<i class="glyphicon glyphicon-usd"></i> ' + cell;
}

class Inventory extends React.Component {
  constructor(props){
    super(props);
    this.getAllRequests = this.getAllRequests.bind(this);
  }
  getAllRequests() {
		axios.get('https:' + '//' + location.hostname + ':3001' + '/api/requests', {

    })
    .then(res => {
      console.log(res);

    })
    .catch(function (error) {
      console.log(error);
    });
	}
  render() {
    this.getAllRequests();
    return (
      <div>
        <BootstrapTable data={ products }>
          <TableHeaderColumn dataField='name' isKey>UserName</TableHeaderColumn>
          <TableHeaderColumn dataField='id'>Item ID</TableHeaderColumn>
          <TableHeaderColumn dataField='serial'>Serial Number</TableHeaderColumn>
          <TableHeaderColumn dataField='quantity'>Quantity</TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
}

export default Inventory;
