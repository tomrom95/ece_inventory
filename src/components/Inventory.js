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
      "Vendor": obj.vendor_info,
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

  loadData(page, justDeleted) {

      if (page <= 0) {
        document.getElementById("pageNum").value = this.state.page;
        return;
      }

      this.instance.get(this.getURL(page))
      .then(function (response) {
        if (response.data.length === 0) {
          document.getElementById("pageNum").value = this.state.page;
          if (justDeleted === true) {
            this.previousPage();
          }
        }
        else {
          this.setState({
            items: processData(response),
            state: page
          });
          document.getElementById("pageNum").value = page;
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
    document.getElementById("pageNum").value = this.state.page;
  }

  nextPage() {
    var nextPage = this.state.page + 1;
    var loadNextPage = true;

    this.instance.get(this.getURL(this.state.page))
      .then(function (response) {
        if (response.data.length > this.state.items.length) {
          this.setState({
              page: this.state.page
          });
          this.loadData(this.state.page);
          document.getElementById("pageNum").value = this.state.page;
          loadNextPage = false;
        }
      }.bind(this));

    if (loadNextPage === true) {
      this.instance.get(this.getURL(nextPage))
        .then(function (response) {
          if (response.data.length === 0) {
            return;
          }
          else {
            this.setState({
                page: nextPage,
            });
            this.loadData(nextPage);
            document.getElementById("pageNum").value = nextPage;
          }
        }.bind(this));
    }

  }

  getURL(page) {
    var url = '/api/inventory/?page='
      + page
      +'&per_page=6';
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
          <ul className="pagination page-section">
            <li className="page-item">
              <a onClick={e=> this.previousPage()} className="page-link" href="#">
                <span className="fa fa-chevron-left"></span>
              </a>
            </li>
            <li className="page-item">
              <a onClick={e=> this.nextPage()} className="page-link" href="#">
                <span className="fa fa-chevron-right"></span>
              </a>
            </li>
            <li className="page-item">{this.makePageBox()}</li>
            <li className="page-item">{this.makePageGoButton()}</li>
          </ul>

        </nav>
        <div className="form-fields">
          <div className="row page-section">
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
          <div className="row page-section">
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

          callback={e => this.loadData(this.state.page, e)}/>
      </div>
      );
  }

  makePageBox() {
    return (
      <input type="text" defaultValue={this.state.page} className="form-control pagenum-textbox" id="pageNum"></input>
    );
  }

  makePageGoButton() {
    return(
      <button type="button"
        className="btn btn-primary"
        onClick={e=> this.loadData(document.getElementById('pageNum').value)}>
        GO
      </button>
    );
  }

}

export default Inventory;
