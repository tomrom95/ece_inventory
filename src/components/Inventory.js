import React, { Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import '../App.css';
import NavBar from './NavBar.js';
import AccordionTable from '../AccordionTable.js';

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

class Inventory extends React.Component {
  constructor(props){
    super(props);
  }
  /*
  render() {
    return (
      <div>
        <BootstrapTable data={ products }>
          <TableHeaderColumn dataField='id' isKey>Product ID</TableHeaderColumn>
          <TableHeaderColumn dataField='name'>Product Name</TableHeaderColumn>
          <TableHeaderColumn dataField='price'>Product Price</TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
  */
  render() {
    return (
      <div>
        <AccordionTable/>
      </div>
      );
  }
}

export default Inventory;
