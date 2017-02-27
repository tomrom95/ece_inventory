import React from 'react';
import axios from 'axios';
import GlobalRequests from '../requests/GlobalRequests';
import CurrentOrders from '../requests/CurrentOrders.js';
import CustomFieldsPopup from './CustomFieldsPopup.js';
import LogPage from '../logging/LogPage.js';

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
      requests: []
    }
    this.addRequests = this.addRequests.bind(this);
  }

  componentDidMount() {
    this.axiosInstance = axios.create({
      baseURL: 'https://' + location.hostname + ':3001/api',
      headers: {'Authorization': localStorage.getItem('token')}
    });
    this.loadData();
  }

  loadData() {
    this.axiosInstance.get('/inventory/' + this.props.params.itemID)
    .then(function(response) {
      this.setState({item: response.data});
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

        for(var k = 0; k < this.props.allCustomFields.length; k++){
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
    if (this.state.error) {
      return (<div>{this.state.error}</div>);
    } else if (this.state.item == null) {
      return (<div></div>);
    }

    if (this.props.isButton === true) {
      button = (<button type="button"
                  className="btn btn-sm btn-outline-primary info-button"
                  data-toggle="modal"
                  data-target={"#infoModal-"+this.props.params.itemID}
                  onClick={() => this.loadData()}>
                    <span className="fa fa-info"></span>
                </button>);
    }
    else if (this.props.isButton === false) {
      button = <a href={"#"}
                  className="log-detailview-links"
                  data-toggle="modal"
                  data-target={"#infoModal-"+this.props.params.itemID}
                  onClick={() => this.loadData()}>
                    {this.state.item.name}
                </a>
    }

    return (
      <div>

        {button}

        <div className="modal fade"
              id={"infoModal-"+this.props.params.itemID}
              tabIndex="-1"
              role="dialog"
              aria-labelledby="infoLabel"
              aria-hidden="true">
            <div className="modal-dialog detail-view" role="document">
              <div className="modal-content info-modal">
                <div className="modal-body">

                  <div className="row">
                    <div className="col-xs-4 detail-view-title"><h4>{this.state.item.name}</h4></div>
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
                  {this.makeCollapsibleItem()}
                </div>
              </div>
            </div>
        </div>
      </div>
    );
  }


  addRequests(){
    if(JSON.parse(localStorage.getItem('user')).role === "ADMIN" || JSON.parse(localStorage.getItem('user')).role === "MANAGER"){
      return(
        <div className="row request-subtable">
          <GlobalRequests
          itemID={this.props.params.itemID}
          rowsPerPage={2}
          status="PENDING"
          showFilterBox={false}
          showStatusFilterBox={false}
          hasOtherParams={true}
          id={"detail-view-"+this.props.params.itemID}/>
        </div>
      );
    }
    else{
      return(
        <div className="row request-subtable">
          <CurrentOrders
          itemID={this.props.params.itemID}
          rowsPerPage={2}
          status="PENDING"
          showFilterBox={false}
          showStatusFilterBox={false}
          hasOtherParams={true}
          id={"detail-view-"+this.props.params.itemID}/>
        </div>);
    }
  }

  makeLogView() {
    var filters = {
      item_id: this.props.params.itemID
    }
    return (
      <div className="row request-subtable">
        <LogPage filters={filters} 
                  showButtons={false} 
                  showFilterBox={false}
                  rowsPerPage={5}/>
      </div>
    );
  }

  makeCollapsibleItem() {
    return (
    <div id="accordion" role="tablist" aria-multiselectable="true">
      <div className="card">
        <div className="card-header" role="tab" id="headingOne">
          <h7 className="mb-0">
            <div data-toggle="collapse" data-parent="#accordion" href={"#requestsCollapse-"+this.props.params.itemID} aria-expanded="true">
              <strong>REQUESTS CONTAINING THIS ITEM</strong>
            </div>
          </h7>
        </div>

        <div id={"requestsCollapse-"+this.props.params.itemID} className="collapse" role="tabpanel">
          <div className="card-block">
            {this.addRequests()}
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header" role="tab" id="headingTwo">
          <h7 className="mb-0">
            <div className="collapsed" data-toggle="collapse" data-parent="#accordion" href={"#logsCollapse-"+this.props.params.itemID} aria-expanded="false">
              <strong>LOG ENTRIES CONTAINING THIS ITEM</strong>
            </div>
          </h7>
        </div>
        <div id={"logsCollapse-"+this.props.params.itemID} className="collapse" role="tabpanel" aria-labelledby="headingTwo">
          <div className="card-block">
            {this.makeLogView()}
          </div>
        </div>
      </div>
    </div>
    );
  }
}


export default ItemDetailView;
