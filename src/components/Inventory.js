import React, { Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import '../App.css';
import NavBar from './NavBar.js';
import InventorySubTable from '../InventorySubTable.js';
import axios from 'axios';

var instance = axios.create({
  baseURL: 'https://' + location.hostname + ':3001'
});

var table;

function initialize() {
  var token = localStorage.getItem("token");
  instance.defaults.headers.common['Authorization'] = token;
  loadTable();
}

function loadTable() {
  instance.get('/api/inventory/')
    .then(function (response) {
      table = makeTable(processData(response));
    })
}

function processData(responseData) {
  var inventoryItems = responseData.data;
  var i;
  var items = [];
  for (i=0; i<inventoryItems.length; i++) {
    var obj = inventoryItems[i];
    var item = {
      "Name": obj.name,
      "Model": obj.model_number,
      "Location": obj.location,
      "Description": obj.description,
      "Quantity": obj.quantity,
      "Tags": obj.tags,
      "meta": {
        "id": obj._id,
        "hasInstanceObjects": obj.has_instance_objects
      }
    };
    console.log("id is: " + item["meta"]["id"]);
    items.push(item);
  }
  console.log(items);
  return items;
}

function makeTable(prop) {
  return(
      <InventorySubTable 
        data={prop} 
        hasButton={true} 
        isInventorySubtable={true}
        api={instance} />);
}

class Inventory extends React.Component {
  constructor(props){
    super(props);
    initialize();
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
        {table}
      </div>
      );
  }
}

export default Inventory;
