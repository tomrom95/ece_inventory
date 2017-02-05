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

      if (page <= 0) {
        document.getElementById("pageNum").value = this.state.page;
        return;
      }

      this.instance.get('/api/inventory/?page='+page+'&per_page=6')
      .then(function (response) {
        if (response.data.length === 0) {
          document.getElementById("pageNum").value = this.state.page;
        }
        else {
          this.setState({
            items: processData(response)
          });
          this.state.page = page;
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

    this.instance.get('/api/inventory/?page='+(this.state.page)+'&per_page=6')
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
      this.instance.get('/api/inventory/?page='+nextPage+'&per_page=6')
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

  render() {
    if (this.state.items.length == 0) {
      return (<div></div>)
    }
    return (
      <div>
        <nav aria-label="page-buttons">
          <ul className="pagination maintable-body">
            <li className="page-item"><a onClick={e=> this.previousPage()} className="page-link" href="#">&lt;</a></li>
            <li className="page-item"><a onClick={e=> this.nextPage()} className="page-link" href="#">&gt;</a></li>
            <li className="page-item">{this.makePageBox()}</li>
            <li className="page-item">{this.makePageGoButton()}</li>
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
