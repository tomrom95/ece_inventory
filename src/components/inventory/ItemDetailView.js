import React from 'react';
import axios from 'axios';
import GlobalRequests from '../requests/GlobalRequests';
import CurrentOrders from '../requests/CurrentOrders.js';
import CustomFieldsPopup from './CustomFieldsPopup.js';
import LogPage from '../logging/LogPage.js';
import LoanPage from '../loans/LoanPage.js';
import TableRow from './TableRow.js';
import AddToCartButton from './AddToCartButton.js';
import PaginationContainer from '../global/PaginationContainer.js';
import InstanceTable from './InstanceTable.js';


function getString(str) {
  if (str === undefined || str === null || str.length === 0) {
    return "N/A";
  }
  else return String(str);
}

class ItemDetailView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      item: null,
      error: null,
      requests: [],
      itemId: props.params.itemID,
      itemName: props.params.itemName,
      requestsVisible: true,
      //instances: [],
    }
    this.addRequests = this.addRequests.bind(this);
  }

  componentDidMount() {
    this.axiosInstance = axios.create({
      baseURL: 'https://' + location.hostname + '/api',
      headers: {'Authorization': localStorage.getItem('token')}
    });
    this.loadData();
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      itemId: newProps.params.itemID,
      itemName: newProps.params.itemName
    });
  }

  loadData() {
    this.axiosInstance.get('/inventory/' + this.state.itemId)
    .then(function(response) {
      this.setState({item: response.data});
        // if(this.state.item.is_asset){
        //   this.getInstances();
        // }
    }.bind(this))
    .catch(function(error) {
      console.log(error);
      this.setState({error: 'Could not load item'});
    }.bind(this));

  }


  makeCustomFields(){
    var fields = this.state.item.custom_fields;
    if(fields.length === 0){
      return(
        <div className="row">
          <p>No custom fields</p>
        </div>
      );
    }
    var html_list = [];

    for(var i = 0; i < fields.length; i++){
      var label = "";

        for (var k = 0; k < this.props.allCustomFields.length; k++){
          if(this.props.allCustomFields[k]._id === fields[i].field){
    				label = this.props.allCustomFields[k].name;
    			}
        }

        if(label !== ""){
          html_list.push(<div className="row" key={fields[i].field+i}>
                            <p key={"row-"+fields[i].field+i}><strong key={"strong-"+fields[i].field+i}>{label}: </strong>
                              {fields[i].value}
                            </p>
                          </div>);
        }

    }
    if(html_list.length === 0){
      return(
        <div className="row">
          <p>No custom fields</p>

        </div>
      );
    }
    else{
      return(html_list);
    }
  }

  render() {
    var button = null;

    if (this.props.isButton === true) {
      button = (<button type="button"
                  className="btn btn-sm btn-outline-primary info-button"
                  data-toggle="modal"
                  data-target={"#infoModal-"+this.state.itemId}
                  onClick={() => {this.loadData(); this.jankRefresh()}}
                  onMouseOver={() => this.loadData()}>
                    <span className="fa fa-info"></span>
                </button>);
    }
    else if (this.props.isButton === false) {
      button = <a href={"#"}
                  className="log-detailview-links"
                  data-toggle="modal"
                  data-target={"#infoModal-"+this.state.itemId}
                  onClick={() => {this.loadData();this.jankRefresh()}}
                  onMouseOver={() => this.loadData()}>
                    {this.state.itemName}
                </a>
    }

    if (this.state.error) {
      return (<div>{this.state.error}</div>);
    }

    if (this.state.item === null) {
      return <div>{button}</div>;
    }

    return (
      <div>

        {button}

        <div className="modal fade"
              id={"infoModal-"+this.state.itemId}
              tabIndex="-1"
              role="dialog"
              aria-labelledby="infoLabel"
              aria-hidden="true">
            <div className="modal-dialog detail-view" role="document">
              <div className="modal-content info-modal">
                <div className="modal-body">

                  <div className="row">
                    <div className="col-xs-4"><h4 className="detail-view-title">{this.state.item.name}</h4></div>
                    <div className="col-xs-8 info-icon"><span className="fa fa-info"></span></div>
                  </div>
                  <div className="row">
                    <div className="offset-md-1 col-md-10">
                      <div className="row">
                        <p><strong>Model Number: </strong>{getString(this.state.item.model_number)}</p>
                      </div>
                      <div className="row">
                        <p><strong>Quantity: </strong>{this.state.item.quantity}</p>
                      </div>
                      <div className="row">
                        <p><strong>Description: </strong>{getString(this.state.item.description)}</p>
                      </div>
                      <div className="row">
                        <p><strong>Vendor Info: </strong>{getString(this.state.item.vendor_info)}</p>
                      </div>
                      <div className="row">
                        <p><strong>Tags: </strong>{getString(this.state.item.tags.join(', '))}</p>
                      </div>
                      {this.makeCustomFields()}
                    </div>

                  </div>
                  {this.makeCollapsibleItems()}
                </div>
              </div>
            </div>
        </div>
      </div>
    );
  }




  processData(responseData) {
    var response_instances = responseData.data;
    var instances = [];
    var allCustomFields = this.props.allCustomFields;
    var item = this.state.item;
    for(var i = 0; i < response_instances.length; i++){
      var instance = response_instances[i];
      var obj = {
          "item": item,
          "Item Name": item.name,
          "Tag": instance.tag,
          "_id": instance._id,
          "allCustomFields": allCustomFields,
      }
      //var rowData = [item.name, instance.tag];
      for(var j = 0; j < allCustomFields.length; j++){

        var value = "N/A";
        for(var k = 0; k < instance.custom_fields.length; k++){
          if(instance.custom_fields[k].field === allCustomFields[j]._id){
            value = instance.custom_fields[k].value;
          }
        }
        var name = allCustomFields[j].name;
        obj[name] = value;
      //  rowData.push(value);
      }

      instances.push(obj);
    //

    }
    return instances;

  }

  addInstances(){

    var table = InstanceTable;
    var url = "/api/inventory/" + this.state.item._id + "/instances?in_stock=true";
    return(
      <div>
        <PaginationContainer
            url={url}
            processData={data => this.processData(data)}
            renderComponent={table}
            showFilterBox={false}
            showStatusFilterBox={false}
            hasOtherParams={true}
            id={'item-instances'}
            rowsPerPage={5} />
      </div>

    );
  }

  addRequests(){
    if(JSON.parse(localStorage.getItem('user')).role === "ADMIN" || JSON.parse(localStorage.getItem('user')).role === "MANAGER"){
      return(
        <div className="item-detail-view-requests">
          <GlobalRequests
          key={"requestsFor-"+this.state.itemId}
          itemID={this.state.itemId}
          rowsPerPage={2}
          status="PENDING"
          showFilterBox={false}
          showStatusFilterBox={false}
          hasOtherParams={true}
          id={"detail-view-"+this.state.itemId}/>
        </div>
      );
    }
    else{
      return(
        <div className="item-detail-view-requests">
          <CurrentOrders
          itemID={this.state.itemId}
          rowsPerPage={2}
          status="PENDING"
          showFilterBox={false}
          showStatusFilterBox={false}
          hasOtherParams={true}
          id={"detail-view-"+this.state.itemId}/>
        </div>);
    }
  }

  makeLogView() {
    var filters = {
      item_id: this.state.itemId
    }
    return (
      <div className="item-detail-view-logs">
        <LogPage filters={filters}
                  showButtons={false}
                  showFilterBox={false}
                  rowsPerPage={5}/>
      </div>
    );
  }

  makeLoanView() {
    var filters = {
      item_name: this.state.item.name,
      type: "OUTSTANDING"
    }

     if(JSON.parse(localStorage.getItem('user')).role === "ADMIN" || JSON.parse(localStorage.getItem('user')).role === "MANAGER") {
        return (
          <div className="item-detail-view-loans">
            <LoanPage isGlobal={true}
                           showFilterBox={false}
                           rowsPerPage={5}
                           filters={filters} />
          </div>);
     }
     else {
        return (
          <div className="item-detail-view-loans">
            <LoanPage isGlobal={false}
                           showFilterBox={false}
                           rowsPerPage={5}
                           filters={filters} />
          </div>);
     }
  }

  jankRefresh() {
    this.setState({
      requestsVisible: false
    }, function() {
      this.setState({
        requestsVisible: true
      });
    }.bind(this));
  }

  makeCollapsibleItems() {
    var instances =
    <div className="card">
      <div className="card-header" role="tab" id="headingFour">
        <h7 className="mb-0">
          <a data-toggle="collapse" data-parent="#accordion" href={"#instancesCollapse-"+this.state.itemId} aria-expanded="true">
            <strong>INSTANCES OF THIS ITEM</strong>
          </a>
        </h7>
      </div>
      <div id={"instancesCollapse-"+this.state.itemId} className="collapse" role="tabpanel">
        <div className="card-block">
          {this.state.requestsVisible ? this.addInstances() : null}
        </div>
      </div>
    </div>;
    var instance_table = this.state.item.is_asset ? instances : <div></div>
    return (
    <div id="accordion" role="tablist" aria-multiselectable="true">
      {instance_table}
      <div className="card">
        <div className="card-header" role="tab" id="headingOne">
          <h7 className="mb-0">
            <a data-toggle="collapse" data-parent="#accordion" href={"#requestsCollapse-"+this.state.itemId} aria-expanded="true">
              <strong>PENDING REQUESTS OF THIS ITEM</strong>
            </a>
          </h7>
        </div>
        <div id={"requestsCollapse-"+this.state.itemId} className="collapse" role="tabpanel">
          <div className="card-block">
            {this.state.requestsVisible ? this.addRequests() : null}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" role="tab" id="headingThree">
          <h7 className="mb-0">
            <a data-toggle="collapse" data-parent="#accordion" href={"#loansCollapse-"+this.state.itemId} aria-expanded="true">
              <strong>OUTSTANDING LOANS OF THIS ITEM</strong>
            </a>
          </h7>
        </div>
        <div id={"loansCollapse-"+this.state.itemId} className="collapse" role="tabpanel">
          <div className="card-block">
            {this.state.requestsVisible ? this.makeLoanView() : null}
          </div>
        </div>
      </div>

      {JSON.parse(localStorage.getItem('user')).role === "ADMIN" || JSON.parse(localStorage.getItem('user')).role === "MANAGER" ?
      (<div className="card">
        <div className="card-header" role="tab" id="headingTwo">
          <h7 className="mb-0">
            <a className="collapsed" data-toggle="collapse" data-parent="#accordion" href={"#logsCollapse-"+this.state.itemId} aria-expanded="false">
              <strong>LOG ENTRIES CONTAINING THIS ITEM</strong>
            </a>
          </h7>
        </div>
        <div id={"logsCollapse-"+this.state.itemId} className="collapse" role="tabpanel" aria-labelledby="headingTwo">
          <div className="card-block">
            {this.state.requestsVisible ? this.makeLogView() : null}
          </div>
        </div>
      </div>) : null }

    </div>
    );
  }
}


export default ItemDetailView;
