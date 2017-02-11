import React, { Component } from 'react';
import '../../App.css';
import axios from 'axios';
import RequestTable from './RequestTable.js';
import PaginationContainer from '../global/PaginationContainer';

class GlobalRequests extends Component {

  constructor(props){
    super(props);

    this.state = {
      itemId: props.itemID,
      status: props.status
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.itemID) {
      this.setState({
        itemId: newProps.itemID
      });
    }

    if (newProps.status) {
      this.setState({
        status: newProps.status
      });
    }
  }

  processData(responseData) {
    var requests = responseData.data;
    var i;
    var items = [];
    for (i=0; i<requests.length; i++) {
      var obj = requests[i];
      var item = {
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
    return items;
  }

  render() {
    var url = '/api/requests/';
    var table = RequestTable;

    if (this.state.itemId) {
        url+='&item_id=' + this.state.itemId;
    }

    if (this.state.status) {
        url+='&status=' + this.state.status;
    }

    if(JSON.parse(localStorage.getItem('user')).is_admin === false){
      return(<div>You are not allowed to access this page.</div>);
    }

    else{
      return (
          <PaginationContainer 
          url={url}
          processData={data=>this.processData(data)}
          renderComponent={table}
          extraProps={
            {global: true}
          } />
      );
    }
  }
}

export default GlobalRequests;
