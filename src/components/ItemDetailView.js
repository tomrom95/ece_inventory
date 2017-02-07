import React from 'react';
import axios from 'axios';
import GlobalRequests from './GlobalRequests';
import CurrentOrders from './CurrentOrders.js';

function getString(str) {
  if (str === undefined || str === null) {
    return "N/A";
  }
  else return String(str);
}

class ItemDetailView extends React.Component {
  constructor(props) {
    super(props);
    var currUser = JSON.parse(localStorage.getItem('user'));
    this.state = {
      item: null,
      error: null,
      requests: []
    }
    this.addPadding = this.addPadding.bind(this);
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

  componentWillReceiveProps(newProps) {
    //this.loadData();
  }

  render() {
    if (this.state.error) {
      return (<div>{this.state.error}</div>);
    } else if (this.state.item == null) {
      return (<div></div>);
    }
    return (
      <div>
        <button type="button"
          className="btn btn-sm btn-outline-primary info-button"
          data-toggle="modal"
          data-target={"#infoModal-"+this.props.params.itemID}>
            <span className="fa fa-info"></span>
        </button>

        <div className="modal fade"
              id={"infoModal-"+this.props.params.itemID}
              tabIndex="-1"
              role="dialog"
              aria-labelledby="infoLabel"
              aria-hidden="true">
            <div className="modal-dialog detail-view" role="document">
              <div className="modal-content">
                <div className="modal-body">

                  <div className="row">
                    <div className="col-xs-4 detail-view-title"><h4>{this.state.item.name}</h4></div>
                    <div className="col-xs-8 info-icon"><span className="fa fa-info"></span></div>
                  </div>
                  <div className="row">
                    <div className="offset-md-1 col-md-10">
                      <div className="row">
                        <p><strong>Quantity: </strong>{this.state.item.quantity}</p>
                      </div>
                      <div className="row">
                        <p><strong>Location: </strong>{getString(this.state.item.location)}</p>
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
                    </div>
                  </div>
                  {this.addPadding()}
                </div>
              </div>
            </div>
        </div>
      </div>
    );
  }


  addPadding(){
    if(JSON.parse(localStorage.getItem('user')).is_admin === true){
      return(
        <div className="row pad-sides">
          <GlobalRequests itemID={this.props.params.itemID} status="PENDING"/>
        </div>
      );
    }
    else{
      return(
        <div className="row pad-sides">
          <CurrentOrders itemID={this.props.params.itemID} status="PENDING"/>
        </div>);
    }
  }
}


export default ItemDetailView;
