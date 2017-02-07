import React, { Component } from 'react';
import '../App.css';
import axios from 'axios';
import RequestTable from './RequestTable.js';


function processData(responseData) {
  var requests = responseData;
  var i;
  var items = [];
  var item;
  for (i=0; i<requests.length; i++) {
    var obj = requests[i];
    if(JSON.parse(localStorage.getItem('user')).is_admin){
      if(obj.user.username === JSON.parse(localStorage.getItem('user')).username){

        item = {
          "Username": obj.user.username,
          "Item": obj.item.name,
          "Time Stamp": obj.created,
          "Quantity": obj.quantity,
          "Reason": obj.reason,
          "Status": obj.status,
          "Response": obj.reviewer_comment,
          "_id": obj._id,
          "user_id": obj.user._id,
          "item_id": obj.item._id,
        };
        items.push(item);
      }
    }
    else{
      item = {
        "Username": obj.user.username,
        "Item": obj.item.name,
        "Time Stamp": obj.created,
        "Quantity": obj.quantity,
        "Reason": obj.reason,
        "Status": obj.status,
        "Response": obj.reviewer_comment,
        "_id": obj._id,
        "user_id": obj.user._id,
        "item_id": obj.item._id,
      };
      items.push(item);
    }

  }
  return items;
}
class CurrentOrders extends Component {
  constructor(props){
    super(props);
    this.state = {
      requests: []
    };
  }

  componentWillMount() {
    this.axiosInstance = axios.create({
      baseURL: 'https://' + location.hostname + ':3001',
      headers: {'Authorization': localStorage.getItem('token')}
    });
    var api = '/api/requests';
    if (this.props.itemID && this.props.status) {
      api += '?item_id=' + this.props.itemID + "&status=" + this.props.status;
    }
    this.axiosInstance.get(api)
    .then(function(response) {
      this.setState({requests: processData(response.data)});
      console.log(this.state.requests);

    }.bind(this))
    .catch(function(error) {
      console.log(error);
    }.bind(this));

  }

	render(){
    if(!this.state.requests || this.state.requests.length === 0 ){
      return(<div></div>);
    }
    else{
      console.log("success");
      return (
        <div className="wide">
          <RequestTable data={this.state.requests} global={false} api={this.axiosInstance}/>


        </div>
      );
    }
	}
}

export default CurrentOrders;
