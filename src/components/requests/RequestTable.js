import React, { Component } from 'react';
import '../../App.css';
import TableRow from '../inventory/TableRow';
import Modal from 'react-modal';
import LeaveCommentModal from './LeaveCommentModal.js';
import RequestItemsPopup from "./RequestItemsPopup.js";


function getKeys(data) {

	if (data.length === 0)
		return;

	var keys = Object.keys(data[0]);
	var i;
	var ret = [];
	for (i=0; i<keys.length; i++) {
    if (keys[i] === "_id" || keys[i] === "user_id" || 
        keys[i] === "item_id" || keys[i] === "Items" || keys[i] === "Reviewer Comment") {
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
      global: this.props.global
		}
    this.denyButton = this.denyButton.bind(this);
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      columnKeys: getKeys(newProps.data),
      rows: getValues(newProps.data, getKeys(newProps.data)),
      raw_data: newProps.data
    });
  }

	makeColumnKeyElements(keys) {
		var i;
		var list = [];
		for (i=0; i<keys.length; i++) {
			list.push(<th key={keys[i]+"-requestcol"}> {keys[i]} </th>);
		}
		list.push(<th key={"buttonSpace-" + 1}> </th>);
    list.push(<th key={"buttonSpace-" + 2}> </th>);

    // in global requests page, we have more buttons
    if (this.state.global === true) {
      list.push(<th key={"buttonSpace-" + 3}> </th>);
      list.push(<th key={"buttonSpace-" + 4}> </th>);
    }

		return list;
	}

	makeRows(rowData) {
		var i;
		var list = [];

		for (i=0; i<rowData.length; i++) {

      var button_list = [];
      if(this.state.global ){
        if(rowData[i][3] === 'PENDING'){
          button_list=[this.denyButton(i), this.approveButton(i), this.commentButton(i)];
        }
        else if (rowData[i][3] === 'APPROVED') {
          button_list=[this.denyButton(i), this.fulfillButton(i),this.commentButton(i)];
        }
        else if (rowData[i][3] === 'DENIED') {
          button_list=[this.blankSpace(i , 1), this.approveButton(i , 2),this.commentButton(i)];
        }
        else if (rowData[i][3] === 'FULFILLED') {
          button_list=[this.blankSpace(i , 1), this.blankSpace(i , 2), this.commentButton(i)];
        }
      }
      else{
				if(rowData[i][3] !== 'FULFILLED'){
					button_list=[this.deleteButton(i)];
				}
				else{
					button_list=[];
				}

      }

      if (button_list.length === 0) {
        button_list.push(this.blankSpace(i, 1));
      }

			var id = this.props.data[i]._id;
      var itemData = this.props.data[i]["Items"];
      var itemsInfoButton = <RequestItemsPopup 
                                key={"request-detail-view-"+id} 
                                id={id} 
                                items={itemData}
                                reviewerComment={(this.state.raw_data[i])["Reviewer Comment"]} />;

      button_list.push(itemsInfoButton);

			var elem = (<TableRow
					columnKeys={this.props.columnKeys}
					data={rowData[i]}
					idTag={id}
					row={i}
					key={this.props.data[i]["_id"]+"-row"}
					api={this.props.api}
          request_buttons={button_list}/>);
			list.push(elem);
		}
		return list;
	}

  denyButton(index){
    return(
			<td key={"delete-td-"+index} className="subtable-row">
	      <button key={"deny"+index} className="btn btn-outline-danger btn-sm" onClick={e => this.denyRequest(index)}>
	        Deny
	      </button>
			</td>
    );
  }

  approveButton(index){
    return(
			<td key={"approve-td-"+index} className="subtable-row">
	      <button key={"approve"+index} className="btn btn-outline-success btn-sm" onClick={e => this.approveRequest(index)}>
	        Approve
	      </button>
			</td>
    );
  }

  fulfillButton(index){
    return(
			<td key={"fulfill-td-"+index} className="subtable-row">
		    <button key={"fulfill"+index} className="btn btn-outline-success btn-sm" onClick={e => this.fulfillRequest(index)}>
		      Fulfill
		    </button>
			</td>
    );
  }

  deleteButton(index){
    return(
			<td key={"delete-td-"+index} className="subtable-row">
      	<button key={"delete"+index} onClick={()=>{this.deleteRequest(index)}} type="button" className="btn btn-sm btn-danger delete-button">×</button>
			</td>
		)
  }

  commentButton(index){
    return(
			<td key={"comment-td-"+index} className="subtable-row">
      	<LeaveCommentModal id={index} 
                          key={"comment-"+index} 
                          request={this.state.raw_data[index]._id} 
                          api={this.props.api}
                          callback={() => this.props.callback()}/>
			</td>
    )
  }

	blankSpace(index , col){
		return(
			<td key={"blank-td-"+index + col} className="subtable-row">
				<button key={"blank"+index + col}  className="white-space-cell" type="button"> hey </button>
			</td>
		);
	}

  approveRequest(index){
    this.props.api.put('/api/requests/' + this.state.raw_data[index]._id,
      {
        status: 'APPROVED',
      }
    )
    .then(function(response) {
      if(response.data.error){
        alert(console.data.error);
      }
      else{
        this.state.rows[index][3] = 'APPROVED'
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
        this.state.rows[index][3] = 'DENIED'
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
        alert(response.data.error);
      }
      else{
        this.state.rows[index][3] = 'FULFILLED'
        this.forceUpdate();
      }
    }.bind(this))
    .catch(function(error) {
      console.log(error);
    }.bind(this));

  }

  deleteRequest(index){
    this.props.api.delete('/api/requests/' + this.state.raw_data[index]._id)
    .then(function(response) {
      if(response.data.error){
        alert(response.data.error);
      }
      else{
				var rows = this.state.rows;
				rows.splice(index,1);
				var raw_data = this.state.raw_data;
				raw_data.splice(index,1);
				this.setState({
					rows: rows,
					raw_data: raw_data
				});
        this.props.callback(true);
      }
    }.bind(this))
    .catch(function(error) {
      console.log(error);
    }.bind(this));

  }

  commentRequest(index) {
    this.props.api.put('/api/requests/' + this.state.raw_data[index]._id,
      {
        reviewer_comment: "for real",
      }
    )
    .then(function(response) {
      if(response.data.error){
        alert(console.data.error);
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
			<table className="table table-sm subtable-body requesttable">
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
