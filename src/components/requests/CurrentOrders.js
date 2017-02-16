import React, { Component } from 'react';
import '../../App.css';
import RequestTable from './RequestTable.js';
import PaginationContainer from '../global/PaginationContainer.js';

function formatDate(dateString) {
  var i;
  var split = dateString.split(' ');
  var date = '';
  for (i=1; i<=4; i++) {
    date += split[i] + ' ';
  }
  return date;
}

class CurrentOrders extends Component {
  constructor(props){
    super(props);
    this.state = {
      itemId: props.itemID,
      status: props.status
    };

  }
  getUserDisplay(user){
    if (!user) {
      return "unknown";
    }
    if (user.first_name && user.last_name) {
      return user.first_name + ' ' + user.last_name;
    } else if (user.netid) {
      return user.netid;
    } else {
      return user.username;
    }
 }

  processData(responseData) {
    var requests = responseData.data;
    var i;
    var items = [];
    var item;
    for (i=0; i<requests.length; i++) {
      var obj = requests[i];
      console.log(obj.user);
      var userDisplay = this.getUserDisplay(obj.user);
      var user_id = obj.user ? obj.user._id : "";
      if(JSON.parse(localStorage.getItem('user')).role === "ADMIN" || JSON.parse(localStorage.getItem('user')).role === "MANAGER"){
        console.log("request");
        if(obj.user._id == JSON.parse(localStorage.getItem('user'))._id){
          console.log("admin request");
          item = {
            "User": userDisplay,
            "Item": obj.item.name,
            "Time Stamp": formatDate(new Date(obj.created).toString()),
            "Quantity": obj.quantity,
            "Reason": obj.reason,
            "Status": obj.status,
            "Response": obj.reviewer_comment,
            "_id": obj._id,
            "user_id": user_id,
            "item_id": obj.item._id,
          };
          items.push(item);
        }
      }
      else{
        item = {
          "User": userDisplay,
          "Item": obj.item.name,
          "Time Stamp": formatDate(new Date(obj.created).toString()),
          "Quantity": obj.quantity,
          "Reason": obj.reason,
          "Status": obj.status,
          "Response": obj.reviewer_comment,
          "_id": obj._id,
          "user_id": user_id,
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
          showStatusFilterBox={this.props.showStatusFilterBox}
          user={JSON.parse(localStorage.getItem('user'))._id}
          id={"user-requests-"+this.props.id}
          hasOtherParams={this.props.hasOtherParams}
          extraProps={
            {global: false}
          } />
    );

	}
}

export default CurrentOrders;
