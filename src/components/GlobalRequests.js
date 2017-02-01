import React, { Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import '../App.css';
import NavBar from './NavBar.js';

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
  render() {
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