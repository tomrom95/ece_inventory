import React, { Component } from 'react';
import '../../App.css';
import PaginationContainer from '../global/PaginationContainer';
import TransactionTable from './TransactionTable.js'

class Transactions extends Component {

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
    var transactions = responseData.data;
    var i;
    var items = [];
    for (i=0; i<transactions.length; i++) {
      var obj = transactions[i];
      var item = {
        "_id": obj._id
      };
      items.push(item);
    }
    return items;
  }

  render() {
    var url = '/api/logs/';
    var table = TransactionTable;

    if (this.state.itemId && this.state.status) {
      url += '?item_id=' + this.state.itemId + "&status=" + this.state.status;
    }

    return (
        <PaginationContainer
        url={url}
        processData={data=>this.processData(data)}
        renderComponent={table}
        showFilterBox={this.props.showFilterBox}
        showStatusFilterBox={false}
        id={"logs-"+this.props.id}
        hasOtherParams={this.props.hasOtherParams}
       />
    );

  }
}

export default Transactions;
