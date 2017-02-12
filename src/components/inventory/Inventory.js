import React, { Component } from 'react';
import '../../App.css';
import InventorySubTable from './InventoryTable.js';
import ErrorMessage from '../global/ErrorMessage.js';
import FilterBox from '../global/FilterBox.js';
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

class Inventory extends Component {
  constructor(props){
    super(props);
    this.state = {
      initialLoad: true,
      items: [],
      page: 1,
      rowsPerPage: 5,
      errorHidden: true,
      error: {
        title: "",
        message: ""
      },
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

      this.instance.get(this.getURL(page, this.state.rowsPerPage))
      .then(function (response) {
        if (this.state.initialLoad) {
          this.setState({initialLoad: false});
        }
        if (response.data.length === 0) {
          if (page === 1) {
            this.setState({items: []})
          } else {
            document.getElementById("pageNum").value = this.state.page;
            if (justDeleted === true) {
              this.previousPage();
            }
          }
        }
        else {
          this.setState({
            items: processData(response),
            page: page
          });
          document.getElementById("pageNum").value = page;
        }
      }.bind(this));
  }

  previousPage() {
    this.loadData(this.state.page - 1);
  }

  nextPage() {
    this.loadData(this.state.page + 1);
  }

  getURL(page, rowsPerPage) {
    var url = '/api/inventory/?page='
      + page
      +'&per_page='+rowsPerPage;
    var filterNames = ["name", "model_number", "required_tags", "excluded_tags"];
    filterNames.forEach(function(filterName) {
      if (this.state.filters[filterName]) {
        url += "&" + filterName + "=" + this.state.filters[filterName];
      }
    }.bind(this));
    return url;
  }

  filterItems(name, modelNumber, requiredTags, excludedTags) {
    this.setState({
      page: 1,
      filters: {
        name: name,
        model_number: modelNumber,
        required_tags: requiredTags,
        excluded_tags: excludedTags
      }
    }, function () {
      this.loadData(1);
    });
  }

  render() {
    var table = null;
    if (this.state.initialLoad) {
      table = (<div></div>);
    } else if (this.state.items.length === 0) {
      table = (<div className="center-text">No items found.</div>);
    } else {
      table = (<InventorySubTable
        data={this.state.items}
        hasButton={true}
        isInventorySubtable={true}
        api={this.instance}
        callback={e => this.loadData(this.state.page, e)}/>);
    }
    return (
      <div className="row inventory-page">
        <div className="col-md-3">
            <FilterBox
              api={this.instance}
              filterItems={this.filterItems.bind(this)}
            />
        </div>

        <div className="col-md-9">
          <div className="row page-section">
              <div className="col-md-3">
                <nav aria-label="page-buttons">
                  <ul className="pagination">
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
              </div>

              <div className="col-md-3">
                {this.makePerPageController()}
              </div>

              <div className="col-md-6" id="error-region">
                <ErrorMessage
                  key={"errormessage"}
                  title={this.state.error.title}
                  message={this.state.error.message}
                  hidden={this.state.errorHidden}
                  hideFunction={()=> this.state.errorHidden=true}/>
              </div>

          </div>

          <div className="row">
            {table}
          </div>
        </div>
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

  renderError(title, message) {
      this.setState({
        errorHidden: false,
        error: {
          title: title,
          message: message
        }
      });
  }

  // making a list of these <a> tags was giving me trouble, so I made them by hand.
  makePerPageController() {
    return(
      <div className="btn-group">
        <button type="button" className="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Items per Page
        </button>
        <div className="dropdown-menu rowcount-dropdown">
          <a onClick={()=>this.setRowCount(5)} className="dropdown-item" href="#">
            {5}
          </a>
          <a onClick={()=>this.setRowCount(10)} className="dropdown-item" href="#">
            {10}
          </a>
          <a onClick={()=>this.setRowCount(15)} className="dropdown-item" href="#">
            {15}
          </a>
          <a onClick={()=>this.setRowCount(20)} className="dropdown-item" href="#">
            {20}
          </a>
          <a onClick={()=>this.setRowCount(25)} className="dropdown-item" href="#">
            {25}
          </a>
          <a onClick={()=>this.setRowCount(30)} className="dropdown-item" href="#">
            {30}
          </a>
          <a onClick={()=>this.setRowCount(35)} className="dropdown-item" href="#">
            {35}
          </a>
          <a onClick={()=>this.setRowCount(40)} className="dropdown-item" href="#">
            {40}
          </a>
          <a onClick={()=>this.setRowCount(45)} className="dropdown-item" href="#">
            {45}
          </a>
          <a onClick={()=>this.setRowCount(50)} className="dropdown-item" href="#">
            {50}
          </a>
        </div>
      </div>
      );
  }

  setRowCount(numRows) {
    this.state.rowsPerPage = numRows;
    this.loadData(1);
  }

}

export default Inventory;
