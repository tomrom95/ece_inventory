import React, { Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import '../App.css';
import NavBar from './NavBar.js';
import InventorySubTable from '../InventorySubTable.js';
import ItemWizard from '../ItemWizard.js';
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
      items: [],
      page: 1
    }
  }

  componentWillMount() {
    this.instance = axios.create({
      baseURL: 'https://' + location.hostname + ':3001',
      headers: {'Authorization': localStorage.getItem('token')}
    });

    this.loadData(this.state.page);
  }

  loadData(page) {
      this.instance.get('/api/inventory/?page='+page+'&per_page=6')
      .then(function (response) {
        console.log("NEW RESPONSE IS: ");
        console.log(response);
        if (response.data.length === 0) {
          this.previousPage();
        }
        else {
          this.setState({
            items: processData(response),
          });
        }
      }.bind(this));
  }

  previousPage() {
    var prevPage = this.state.page - 1;
    if (prevPage > 0) {
      this.setState({
        page: prevPage
      });
      this.loadData(prevPage);
    }
  }

  nextPage() {
    var nextPage = this.state.page + 1;

    this.instance.get('/api/inventory/?page='+(this.state.page)+'&per_page=6')
      .then(function (response) {
        if (response.data.length > this.state.items.length) {
          console.log("More results on this page");
          this.setState({
              page: this.state.page
          });
          this.loadData(this.state.page);
        }
      }.bind(this));

    this.instance.get('/api/inventory/?page='+nextPage+'&per_page=6')
      .then(function (response) {
        if (response.data.length === 0) {
          console.log("NO RESULTS LEFT");
          return;
        }
        else {
          this.setState({
              page: nextPage
          });
          this.loadData(nextPage);
        }
      }.bind(this));
  }

  render() {
    if (this.state.items.length == 0) {
      return (<div></div>)
    }
    return (
      <div>
        <nav aria-label="page-buttons">
          <ul className="pagination maintable-body">
            <li className="page-item"><a onClick={e=> this.previousPage()} className="page-link" href="#">&lt;</a></li>
            <li className="page-item"><a className="page-link" href="#">{this.state.page}</a></li>
            <li className="page-item"><a onClick={e=> this.nextPage()} className="page-link" href="#">&gt;</a></li>
          </ul> 
        </nav>

        <InventorySubTable
          data={this.state.items}
          hasButton={true}
          isInventorySubtable={true}
          api={this.instance}
          callback={() => this.loadData(this.state.page)}/>
      </div>
      );
  }
}

export default Inventory;
