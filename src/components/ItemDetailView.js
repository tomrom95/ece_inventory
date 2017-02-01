import React from 'react';
import axios from 'axios';

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
    this.axiosInstance.get('/requests?item_id=' + this.props.params.itemID)
      .then(function(response) {
        this.setState({requests: response.data})
      }.bind(this))
      .catch(function(error) {
        this.setState({erroe: 'Could not load requests'});
      }.bind(this));
  }

  clearFields() {
    this.refs.username.value = '';
    this.refs.password.value = '';
    this.refs.isAdmin.checked = false;
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
          <div className="col-xs-6"><h4>{this.state.item.name}</h4></div>
        </div>
        <div className="row">
          <p><strong>Quantity: </strong>{this.state.item.quantity}</p>
          <p><strong>Location: </strong>{this.state.item.location}</p>
          <p><strong>Description: </strong>{this.state.item.description}</p>
          <p><strong>Vendor Info: </strong>{this.state.item.vendor_info}</p>
          <p><strong>Tags: </strong>{this.state.item.tags.join(', ')}</p>
        </div>
      </div>
    );
  }
}

export default ItemDetailView;
