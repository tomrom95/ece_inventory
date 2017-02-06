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
    items.push(item);
  }
  return items;
}

class Inventory extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      items: [],
      page: 1,
      filters: {
        name: "",
        model_number: "",
        excluded_tags: "",
        required_tags: ""
      }
    }
    this.getURL = this.getURL.bind(this);
  }

  componentWillMount() {
    this.instance = axios.create({
      baseURL: 'https://' + location.hostname + ':3001',
      headers: {'Authorization': localStorage.getItem('token')}
    });

    this.loadData(this.state.page);
  }

  loadData(page) {
      this.instance.get(this.getURL(page))
      .then(function (response) {
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

    this.instance.get(this.getURL(this.state.page))
      .then(function (response) {
        if (response.data.length > this.state.items.length) {
          this.setState({
              page: this.state.page
          });
          this.loadData(this.state.page);
        }
      }.bind(this));

    this.instance.get(this.getURL(nextPage))
      .then(function (response) {
        if (response.data.length === 0) {
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

  getURL(page) {
    var url = '/api/inventory/?page='
      + page
      +'&per_page=10';
    var filterNames = ["name", "model_number", "required_tags", "excluded_tags"];
    filterNames.forEach(function(filterName) {
      if (this.state.filters[filterName]) {
        url += "&" + filterName + "=" + this.state.filters[filterName];
      }
    }.bind(this));
    return url;
  }

  filterItems() {
    this.setState({
      page: 1,
      filters: {
        name: this.refs.name.value,
        model_number: this.refs.model.value,
        required_tags: this.refs.required.value,
        excluded_tags: this.refs.excluded.value
      }
    }, function () {
      this.loadData(1);
    });
  }

  render() {
    if (this.state.items.length == 0) {
      return (<div></div>)
    }
    console.log(this.state.isAdmin);

    return (
      <div>
        <nav aria-label="page-buttons">
          <ul className="pagination maintable-body">
            <li className="page-item"><a onClick={e=> this.previousPage()} className="page-link" href="#">&lt;</a></li>
            <li className="page-item"><a className="page-link" href="#">{this.state.page}</a></li>
            <li className="page-item"><a onClick={e=> this.nextPage()} className="page-link" href="#">&gt;</a></li>
          </ul>
        </nav>
        <div className="form-fields">
          <div className="row maintable-body">
            <div className="col-md-4">
              <div className="form-group row">
                <label htmlFor="name-field" className="col-2 col-form-label">Name</label>
                <div className="col-6">
                  <input className="form-control" type="text" defaultValue="" ref="name" id="name-field"/>
                </div>
        			</div>
            </div>
            <div className="col-md-4">
              <div className="form-group row">
                <label htmlFor="model-field" className="col-2 col-form-label">Model</label>
                <div className="col-6">
                  <input className="form-control" type="text" defaultValue="" ref="model" id="model-field"/>
                </div>
        			</div>
            </div>
          </div>
          <div className="row maintable-body">
            <div className="col-md-4">
              <div className="form-group row">
                <label htmlFor="required-tags-field" className="col-2 col-form-label">Required Tags</label>
                <div className="col-8">
                  <input className="form-control" type="text" defaultValue="" ref="required" id="required-tags-field"/>
                </div>
        			</div>
            </div>
            <div className="col-md-4">
              <div className="form-group row">
                <label htmlFor="excluded-tags-field" className="col-2 col-form-label">Excluded Tags</label>
                <div className="col-8">
                  <input className="form-control" type="text" defaultValue="" ref="excluded" id="excluded-tags-field"/>
                </div>
        			</div>
            </div>
            <div className="col-md-4">
              <button
                className="btn btn-primary"
                onClick={this.filterItems.bind(this)}
              >
                Filter
              </button>
            </div>
          </div>
        </div>
        <InventorySubTable
          data={this.state.items}
          hasButton={true}
          isInventorySubtable={true}
          api={this.instance}
          isAdmin={this.props.isAdmin}
          callback={() => this.loadData(this.state.page)}/>
      </div>
      );
  }
}

export default Inventory;
