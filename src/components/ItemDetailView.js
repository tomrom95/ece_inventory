import React from 'react';
import axios from 'axios';
import GlobalRequests from './GlobalRequests';

class ItemDetailView extends React.Component {
  constructor(props) {
    super(props);
    var currUser = JSON.parse(localStorage.getItem('user'));
    this.state = {
      item: null,
      error: null,
      requests: [],
    }
  }

  componentWillMount() {
    this.axiosInstance = axios.create({
      baseURL: 'https://' + location.hostname + ':3001/api',
      headers: {'Authorization': localStorage.getItem('token')}
    });
    this.axiosInstance.get('/inventory/' + this.props.params.itemID)
      .then(function(response) {
        console.log(response.data);
        this.setState({item: response.data});
      }.bind(this))
      .catch(function(error) {
        this.setState({error: 'Could not load item'});
      }.bind(this));
  }

  render() {
    if (this.state.error) {
      return (<div>{this.state.error}</div>);
    } else if(this.state.item == null) {
      return (<div></div>);
    }
    return (
      <div>
        <div className="row">
          <div className="offset-md-4 col-md-4 center-text"><h4>{this.state.item.name}</h4></div>
        </div>
        <div className="row">
          <div className="offset-md-1 col-md-10">
            <div className="row">
              <p><strong>Quantity: </strong>{this.state.item.quantity}</p>
            </div>
            <div className="row">
              <p><strong>Location: </strong>{this.state.item.location}</p>
            </div>
            <div className="row">
              <p><strong>Description: </strong>{this.state.item.description}</p>
            </div>
            <div className="row">
              <p><strong>Vendor Info: </strong>{this.state.item.vendor_info}</p>
            </div>
            <div className="row">
              <p><strong>Tags: </strong>{this.state.item.tags.join(', ')}</p>
            </div>
          </div>
        </div>
        <div className="row pad-sides">
          <GlobalRequests itemID={this.props.params.itemID} status="PENDING"/>
        </div>
      </div>
    );
  }
}

export default ItemDetailView;
