import React, { Component } from 'react';
import { RouteHandler, Link } from 'react-router';
import SubtableRow from '../SubtableRow.js';
import Request from './Request.js';
import '../App.css';

function getKeys(data) {
    if (data.length == 0)
    	return;
    return Object.keys(data[0]);
}

function getValues(data) {
	var i; var j;
	var keys = getKeys(data);
	console.log(keys);
	var vals = [];
	for (i=0; i<data.length; i++) {
		var row = [];
		for (j=0; j<keys.length; j++) {
			row.push(data[i][keys[j]]);
		}
		vals.push(row);
	}
	return vals;
}

class RequestTable extends Component {
  constructor(props){
    super(props);
    this.state = {
      requests: this.props.requests,
      isAdmin: this.props.isAdmin,
    };
    //console.log(this.state.requests);
  }
  makeColumnKeyElements() {
    var i;
    var list = [];
    var keys = getKeys(this.state.requests);
    for (i=0; i<keys.length; i++) {
      list.push(<th key={keys[i]}> {keys[i]} </th>);
    }
    list.push(<th key={"buttonSpace"}> </th>);
    return list;
  }

  makeRows() {
    var i;
    var list = [];
    var rowData = getValues(this.state.requests);
    for (i=0; i<rowData.length; i++) {
      console.log(rowData[i]);
      var elem;
      var request = rowData[i];
      elem = (<Request
          data={rowData[i]}
          isAdmin={this.state.isAdmin}
          />);
      list.push(elem);
    }
    return list;
  }


  deleteButton(index){
    return(
      <button className="btn btn-primary" onClick={e => this.removeRequest(index)}>
        Delete
      </button>
    );
  }


  removeRequest(index){
    this.setState({
      requests: this.state.requests.filter((_, i) => i !== index)
    })
  }

  render() {

    return (
      <div className="subtable-body">
        <table className="table subtable-body">
          <thead className="thread">
            <tr>
              {this.makeColumnKeyElements()}
            </tr>
          </thead>
          <tbody>
            {this.makeRows()}
          </tbody>
        </table>
      </div>
    );

  }

}

export default RequestTable;
