import React, { Component } from 'react';
import '../../App.css';
import RequestTable from './RequestTable.js';
import PaginationContainer from '../global/PaginationContainer.js';

class CurrentOrders extends Component {
  constructor(props){
    super(props);
    this.state = {
      itemId: props.itemID,
      status: props.status
    };
  }

  processData(responseData) {
    var requests = responseData.data;
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

	render(){
    var url = '/api/requests/';
    var table = RequestTable;

    if (this.props.itemID && this.props.status) {
      url += '?item_id=' + this.props.itemID + "&status=" + this.props.status;
    }

    return (
          <PaginationContainer 
          url={url}
          processData={data=>this.processData(data)}
          renderComponent={table}
          showFilterBox={this.props.showFilterBox}
          id={"user-requests-"+this.props.id}
          hasOtherParams={this.props.hasOtherParams}
          extraProps={
            {global: false}
          } />
    );
    
	}
}

export default CurrentOrders;
