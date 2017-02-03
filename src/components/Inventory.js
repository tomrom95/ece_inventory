import React, { Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import '../App.css';
import NavBar from './NavBar.js';
import InventorySubTable from '../InventorySubTable.js';
import axios from 'axios';

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

class Inventory extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      items: []
    }
  }

  componentWillMount() {
    this.instance = axios.create({
      baseURL: 'https://' + location.hostname + ':3001',
      headers: {'Authorization': localStorage.getItem('token')}
    });

    this.instance.get('/api/inventory/')
      .then(function (response) {
        this.setState({
          items: processData(response),
        });
      }.bind(this))
  }

  render() {
    if (this.state.items.length == 0) {
      return (<div></div>)
    }
    return (
      <div>
        <InventorySubTable
          data={this.state.items}
          hasButton={true}
          isInventorySubtable={true}
          api={this.instance} />);
      </div>
      );
  }
}

export default Inventory;
