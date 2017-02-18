import React, { Component } from 'react';
import '../../App.css';
import RequestTable from './RequestTable.js';
import PaginationContainer from '../global/PaginationContainer';

function formatDate(dateString) {
  var i;
  var split = dateString.split(' ');
  var date = '';
  for (i=1; i<=4; i++) {
    date += split[i] + ' ';
  }
  return date;
}

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
    for (i=0; i<requests.length; i++) {
      var obj = requests[i];
      var userDisplay = this.getUserDisplay(obj.user);
      var user_id = obj.user ? obj.user._id : "";
      var item = {
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
    return items;
  }

  render() {
    var url = '/api/requests/';
    var table = RequestTable;

    if (this.state.itemId && this.state.status) {
      url += '?item_id=' + this.state.itemId + "&status=" + this.state.status;
    }

    if(JSON.parse(localStorage.getItem('user')).is_admin === false){
      return(<div className="text-center">You are not allowed to access this page.</div>);
    }

    else{
      return (
          <PaginationContainer
          url={url}
          processData={data=>this.processData(data)}
          renderComponent={table}
          showFilterBox={this.props.showFilterBox}
          showStatusFilterBox={this.props.showStatusFilterBox}
          id={"global-request-"+this.props.id}
          hasOtherParams={this.props.hasOtherParams}
          extraProps={
            {global: true}
          } />
      );
    }
  }
}

export default GlobalRequests;
