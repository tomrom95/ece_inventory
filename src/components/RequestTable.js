import React, { Component } from 'react';
import '../App.css';
import SubtableRow from '../SubtableRow';

var meta;

function getKeys(data) {

	if (data.length == 0)
		return;

	var keys = Object.keys(data[0]);
	var i;
	var ret = [];
	for (i=0; i<keys.length; i++) {
    if (keys[i] == "_id" || keys[i] === "user_id" || keys[i] === "item_id") {
			continue;
		}
		else ret.push(keys[i]);
	}
	return ret;
}

function getValues(data, keys) {
	var i; var j;
	var vals = [];
	for (i=0; i<data.length; i++) {
		var row = [];
		for (j=0; j<keys.length; j++) {
			row.push(String(data[i][keys[j]]).replace(/,/g,', '));
		}
		vals.push(row);
	}
	return vals;
}

class RequestTable extends Component {

	constructor(props) {
		super(props);
		this.state = {
			columnKeys: getKeys(this.props.data),
			rows: getValues(this.props.data, getKeys(this.props.data)),
      raw_data: this.props.data,
      isAdmin: this.props.isAdmin
		}
    this.denyButton = this.denyButton.bind(this);
	}



	makeColumnKeyElements(keys) {
		var i;
		var list = [];
		for (i=0; i<keys.length; i++) {
			list.push(<th key={keys[i]+"-requestcol"}> {keys[i]} </th>);
		}
		list.push(<th key={"buttonSpace"}> </th>);
		return list;
	}

	makeRows(rowData) {
		var i;
		var list = [];
    var button_list = [];

		for (i=0; i<rowData.length; i++) {
      if(this.state.isAdmin){
        if(rowData[i][5] === 'PENDING'){
          button_list=[this.denyButton(i), this.approveButton(i)];
        }
        else if (rowData[i][5] === 'APPROVED') {
          button_list=[this.denyButton(i), this.fulfillButton(i)];
        }
        else if (rowData[i][5] === 'DENIED') {
          button_list=[this.approveButton(i)];
        }
        else if (rowData[i][5] === 'FULFILLED') {
          button_list=[];
        }
      }
      else{
        button_list=[this.deleteButton(i)];
      }

			var elem;
			var id = this.props.data[i]["_id"] + this.props.data[i]["user_id"] + i;
			elem = (<SubtableRow
					columnKeys={this.props.columnKeys}
					data={rowData[i]}
					idTag={id}
					row={i}
					key={id+"-row"}
					api={this.props.api}
          request_buttons={button_list}/>);
			list.push(elem);
		}
		return list;
	}

  denyButton(index){
    return(
      <button key={"deny"+index} className="btn btn-primary" onClick={e => this.denyRequest(index)}>
        Deny
      </button>
    );
  }

  approveButton(index){
    return(
      <button key={"approve"+index} className="btn btn-primary" onClick={e => this.approveRequest(index)}>
        Approve
      </button>
    );
  }

  fulfillButton(index){
    return(
      <button key={"fulfill"+index} className="btn btn-primary" onClick={e => this.fulfillRequest(index)}>
        Fulfill
      </button>
    );
  }

  deleteButton(index){
    return(
      <button onClick={()=>{this.deleteRequest(index)}} type="button" className="btn btn-danger delete-button">X</button>
    )
  }

  approveRequest(index){
    this.props.api.put('/api/requests/' + this.state.raw_data[index]._id,
      {
        status: 'APPROVED',
      }
    )
    .then(function(response) {
      if(response.data.error){
        console.log("error denying request");
      }
      else{
        this.state.rows[index][5] = 'APPROVED'
        this.forceUpdate();
      }
    }.bind(this))
    .catch(function(error) {
      console.log(error);
    }.bind(this));

  }

  denyRequest(index){
    this.props.api.put('/api/requests/' + this.state.raw_data[index]._id,
      {
        status: 'DENIED',
      }
    )
    .then(function(response) {
      if(response.data.error){
        console.log("error denying request");
      }
      else{
        this.state.rows[index][5] = 'DENIED'
        this.forceUpdate();
      }
    }.bind(this))
    .catch(function(error) {
      console.log(error);
    }.bind(this));

  }

  fulfillRequest(index){
    this.props.api.patch('/api/requests/' + this.state.raw_data[index]._id,
      {
        action: "DISBURSE",
      }
    )
    .then(function(response) {
      if(response.data.error){
        console.log(response.data.error);
      }
      else{
        this.state.rows[index][5] = 'FULFILLED'
        this.forceUpdate();
      }
    }.bind(this))
    .catch(function(error) {
      console.log(error);
    }.bind(this));

  }

  deleteRequest(index){
    this.props.api.delete('/api/requests/' + this.state.raw_data[index]._id,
      {

      }
    )
    .then(function(response) {
      if(response.data.error){
        console.log(response.data.error);
      }
      else{

      }
    }.bind(this))
    .catch(function(error) {
      console.log(error);
    }.bind(this));

  }



  render() {
		return (
			<table className="table subtable-body">
			  <thead className="thread">
			    <tr>
		    	  {this.makeColumnKeyElements(this.state.columnKeys)}
			    </tr>
			  </thead>
			  <tbody>
			  	{this.makeRows(this.state.rows)}
			  </tbody>
			</table>
		);
	}


}

export default RequestTable;
